import type { AnyColumn } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import RNBlobUtil from 'react-native-blob-util';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  saveDocuments,
  types,
} from '@react-native-documents/picker';
import type { AppDatabase } from '../../../db/types';
import type { Repositories } from '../../../db/repositories';
import {
  bodyWeightLogs,
  exerciseNameOverrides,
  exercises,
  planDayExercises,
  planDays,
  plans,
  users,
  workoutSessions,
  workoutSessionSets,
} from '../../../db/schema';
import { createSettingsService } from './settingsService';
import type { AppSettings } from '../types';

const BACKUP_VERSION = 1;

export interface BackupFile {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    users: (typeof users.$inferSelect)[];
    // Solo ejercicios personalizados (spec 5.6): los del catálogo externo se
    // reconstruyen re-importando el catálogo, no viajan en el backup.
    exercises: (typeof exercises.$inferSelect)[];
    // Referencia liviana (id + nombre, sin media) de los ejercicios del
    // catálogo que sí están referenciados por planes/sesiones del usuario,
    // para poder re-enlazarlos por nombre al importar en un dispositivo
    // donde el catálogo se reimportó con IDs nuevos (ver comentario en
    // `importBackup`).
    catalogExerciseRefs: { id: string; name: string }[];
    // Ediciones locales de nombres del catálogo, identificadas por el nombre
    // canónico en inglés (los IDs del catálogo cambian entre instalaciones).
    exerciseNameOverrides?: {
      exerciseName: string;
      language: string;
      name: string;
    }[];
    plans: (typeof plans.$inferSelect)[];
    planDays: (typeof planDays.$inferSelect)[];
    planDayExercises: (typeof planDayExercises.$inferSelect)[];
    workoutSessions: (typeof workoutSessions.$inferSelect)[];
    workoutSessionSets: (typeof workoutSessionSets.$inferSelect)[];
    bodyWeightLogs: (typeof bodyWeightLogs.$inferSelect)[];
    settings: AppSettings;
  };
}

export interface ImportBackupResult {
  importedCounts: Record<string, number>;
  // Series/ejercicios de plan que no se pudieron re-enlazar a un ejercicio
  // del catálogo actual (ni por id ni por nombre) y quedaron sin importar.
  skippedExerciseRefs: number;
}

// Upsert genérico por `id`: usado solo acá para no repetir el mismo
// insert+onConflictDoUpdate ocho veces, una por tabla del backup. El cast es
// necesario porque `AppDatabase.insert` está tipado contra el driver
// (op-sqlite/better-sqlite3), no contra una tabla genérica.
async function upsertRows<
  Row extends Record<string, unknown>,
  Table extends SQLiteTable & { id: AnyColumn },
>(db: AppDatabase, table: Table, rows: Row[]): Promise<number> {
  let count = 0;
  for (const row of rows) {
    await (db.insert(table as any).values(row) as any).onConflictDoUpdate({
      target: table.id,
      set: row,
    });
    count += 1;
  }
  return count;
}

export function createBackupService(
  db: AppDatabase,
  repositories: Repositories,
) {
  const settingsService = createSettingsService(repositories);

  async function buildBackup(): Promise<BackupFile> {
    const [
      allUsers,
      allExercises,
      allNameOverrides,
      allPlans,
      allPlanDays,
      allPlanDayExercises,
      allWorkoutSessions,
      allWorkoutSessionSets,
      allBodyWeightLogs,
      settings,
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(exercises),
      db.select().from(exerciseNameOverrides),
      db.select().from(plans),
      db.select().from(planDays),
      db.select().from(planDayExercises),
      db.select().from(workoutSessions),
      db.select().from(workoutSessionSets),
      db.select().from(bodyWeightLogs),
      settingsService.loadSettings(),
    ]);

    const customExercises = allExercises.filter(e => e.isCustom);
    const customExerciseIds = new Set(customExercises.map(e => e.id));
    const exerciseNameById = new Map(allExercises.map(e => [e.id, e.name]));

    const referencedExerciseIds = new Set<string>();
    for (const row of allPlanDayExercises) {
      referencedExerciseIds.add(row.exerciseId);
    }
    for (const row of allWorkoutSessionSets) {
      referencedExerciseIds.add(row.exerciseId);
    }

    const catalogExerciseRefs: { id: string; name: string }[] = [];
    for (const exerciseId of referencedExerciseIds) {
      if (customExerciseIds.has(exerciseId)) {
        continue;
      }
      const name = exerciseNameById.get(exerciseId);
      if (name) {
        catalogExerciseRefs.push({ id: exerciseId, name });
      }
    }

    const nameOverrides = allNameOverrides.flatMap(row => {
      const exerciseName = exerciseNameById.get(row.exerciseId);
      return exerciseName && !customExerciseIds.has(row.exerciseId)
        ? [{ exerciseName, language: row.language, name: row.name }]
        : [];
    });

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        users: allUsers,
        exercises: customExercises,
        catalogExerciseRefs,
        exerciseNameOverrides: nameOverrides,
        plans: allPlans,
        planDays: allPlanDays,
        planDayExercises: allPlanDayExercises,
        workoutSessions: allWorkoutSessions,
        workoutSessionSets: allWorkoutSessionSets,
        bodyWeightLogs: allBodyWeightLogs,
        settings,
      },
    };
  }

  async function importBackup(backup: BackupFile): Promise<ImportBackupResult> {
    if (backup.version !== BACKUP_VERSION) {
      throw new Error(`Versión de backup no soportada: ${backup.version}`);
    }

    const importedCounts: Record<string, number> = {};

    importedCounts.users = await upsertRows(db, users, backup.data.users);
    importedCounts.exercises = await upsertRows(
      db,
      exercises,
      backup.data.exercises,
    );

    // Reenlace de ejercicios del catálogo: el catálogo se reimporta con IDs
    // nuevos en cada instalación (ver `importExerciseCatalogIfNeeded`), así
    // que los `exerciseId` grabados en el backup casi nunca van a coincidir
    // con los del dispositivo que importa. Se intenta reenlazar por nombre
    // contra el catálogo ya presente en este dispositivo; si no hay match,
    // esa fila se omite en vez de romper la restricción de FK.
    const currentExercises = await db.select().from(exercises);
    const currentExerciseIds = new Set(currentExercises.map(e => e.id));
    const currentExerciseIdByName = new Map(
      currentExercises.map(e => [e.name, e.id]),
    );
    const exerciseIdRemap = new Map<string, string>();
    for (const ref of backup.data.catalogExerciseRefs) {
      if (currentExerciseIds.has(ref.id)) {
        exerciseIdRemap.set(ref.id, ref.id);
        continue;
      }
      const matchedId = currentExerciseIdByName.get(ref.name);
      if (matchedId) {
        exerciseIdRemap.set(ref.id, matchedId);
      }
    }

    function resolveExerciseId(exerciseId: string): string | null {
      if (currentExerciseIds.has(exerciseId)) {
        return exerciseId;
      }
      return exerciseIdRemap.get(exerciseId) ?? null;
    }

    // Mismo criterio de fusión que el resto (upsert): la edición del backup
    // pisa la local del mismo ejercicio+idioma. Se reenlaza por nombre
    // canónico; si el ejercicio ya no existe se omite.
    const catalogIdByName = new Map(
      currentExercises.filter(e => !e.isCustom).map(e => [e.name, e.id]),
    );
    let nameOverridesImported = 0;
    for (const row of backup.data.exerciseNameOverrides ?? []) {
      const exerciseId = catalogIdByName.get(row.exerciseName);
      if (exerciseId) {
        await repositories.exerciseNameOverrides.upsert(
          exerciseId,
          row.language,
          row.name,
        );
        nameOverridesImported += 1;
      }
    }
    importedCounts.exerciseNameOverrides = nameOverridesImported;

    importedCounts.plans = await upsertRows(db, plans, backup.data.plans);
    importedCounts.planDays = await upsertRows(
      db,
      planDays,
      backup.data.planDays,
    );

    let skippedExerciseRefs = 0;

    const resolvablePlanDayExercises = backup.data.planDayExercises.flatMap(
      row => {
        const resolvedExerciseId = resolveExerciseId(row.exerciseId);
        if (!resolvedExerciseId) {
          skippedExerciseRefs += 1;
          return [];
        }
        return [{ ...row, exerciseId: resolvedExerciseId }];
      },
    );
    importedCounts.planDayExercises = await upsertRows(
      db,
      planDayExercises,
      resolvablePlanDayExercises,
    );

    importedCounts.workoutSessions = await upsertRows(
      db,
      workoutSessions,
      backup.data.workoutSessions,
    );

    const resolvableSets = backup.data.workoutSessionSets.flatMap(row => {
      const resolvedExerciseId = resolveExerciseId(row.exerciseId);
      if (!resolvedExerciseId) {
        skippedExerciseRefs += 1;
        return [];
      }
      return [{ ...row, exerciseId: resolvedExerciseId }];
    });
    importedCounts.workoutSessionSets = await upsertRows(
      db,
      workoutSessionSets,
      resolvableSets,
    );

    importedCounts.bodyWeightLogs = await upsertRows(
      db,
      bodyWeightLogs,
      backup.data.bodyWeightLogs,
    );

    await Promise.all(
      (Object.keys(backup.data.settings) as (keyof AppSettings)[]).map(key =>
        settingsService.saveSetting(key, backup.data.settings[key]),
      ),
    );

    return { importedCounts, skippedExerciseRefs };
  }

  // Genera el JSON en el almacenamiento propio de la app y abre el selector
  // nativo "Guardar como" de Android (Storage Access Framework) para que el
  // usuario elija dónde guardarlo. Se usa `saveDocuments` (no
  // `actionViewIntent`) porque abrir el archivo con `ACTION_VIEW` requiere
  // que el dispositivo tenga instalada una app que sepa "ver" JSON — muchos
  // dispositivos no tienen ninguna y la acción falla con `ENOAPP`; guardarlo
  // vía SAF en cambio siempre funciona, lo resuelve el propio Android.
  // Devuelve `null` si el usuario cancela el diálogo.
  async function exportBackupToFile(): Promise<string | null> {
    const backup = await buildBackup();
    const fileName = `gymapk-backup-${backup.exportedAt.replace(
      /[:.]/g,
      '-',
    )}.json`;
    const path = `${RNBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
    await RNBlobUtil.fs.writeFile(path, JSON.stringify(backup), 'utf8');
    try {
      const [saved] = await saveDocuments({
        sourceUris: [`file://${path}`],
        mimeType: 'application/json',
        fileName,
      });
      return saved.uri;
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return null;
      }
      throw error;
    }
  }

  // Abre el selector de archivos de Android (Storage Access Framework) y, si
  // el usuario elige un archivo, lo lee e importa. Devuelve `null` si
  // cancela el picker en vez de lanzar un error.
  async function importBackupFromPicker(): Promise<ImportBackupResult | null> {
    let picked;
    try {
      [picked] = await pick({ type: [types.json], mode: 'open' });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return null;
      }
      throw error;
    }
    const content = await RNBlobUtil.fs.readFile(picked.uri, 'utf8');
    const backup = JSON.parse(content) as BackupFile;
    return importBackup(backup);
  }

  return {
    buildBackup,
    importBackup,
    exportBackupToFile,
    importBackupFromPicker,
  };
}

export type BackupService = ReturnType<typeof createBackupService>;
