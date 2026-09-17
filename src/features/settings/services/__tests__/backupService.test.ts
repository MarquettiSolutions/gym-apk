import { createTestDb } from '../../../../db/repositories/testDb';
import { createRepositories } from '../../../../db/repositories';
import { exercises, planDayExercises } from '../../../../db/schema';
import { createBackupService } from '../backupService';
import type { BackupFile } from '../backupService';

function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const service = createBackupService(db, repositories);
  return { db, repositories, service };
}

async function seedSourceData(
  setupResult: ReturnType<typeof setup>,
  catalogExerciseId: string,
) {
  const { db, repositories } = setupResult;
  const user = await repositories.users.getOrCreateLocalUser();
  await db
    .insert(exercises)
    .values({ id: catalogExerciseId, name: 'Sentadilla', isCustom: false });
  await db
    .insert(exercises)
    .values({ id: 'ex-custom-1', name: 'Mi ejercicio', isCustom: true });

  const plan = await repositories.plans.create({
    userId: user.id,
    name: 'Plan A',
  });
  const day = await repositories.planDays.create({
    planId: plan.id,
    weekday: 1,
  });
  const planDayExercise = await repositories.planDayExercises.create({
    planDayId: day.id,
    exerciseId: catalogExerciseId,
    targetSets: 3,
    targetReps: 10,
    restSeconds: 30,
  });
  const session = await repositories.workoutSessions.create({
    userId: user.id,
    planDayId: day.id,
  });
  await repositories.workoutSessions.addSet({
    sessionId: session.id,
    planDayExerciseId: planDayExercise.id,
    exerciseId: catalogExerciseId,
    setNumber: 1,
    repsDone: 10,
    weightDone: 40,
    weightUnit: 'kg',
  });
  await repositories.bodyWeightLogs.addLog({ userId: user.id, weight: 80 });

  return { user, plan, day, planDayExercise, session };
}

describe('backupService', () => {
  it('re-importar el mismo backup en la misma DB no duplica filas', async () => {
    const setupResult = setup();
    await seedSourceData(setupResult, 'ex-catalog-1');

    const backup = await setupResult.service.buildBackup();
    const firstImport = await setupResult.service.importBackup(backup);
    const secondImport = await setupResult.service.importBackup(backup);

    expect(firstImport.skippedExerciseRefs).toBe(0);
    expect(secondImport.skippedExerciseRefs).toBe(0);

    const allExercises = await setupResult.db.select().from(exercises);
    // Solo el ejercicio personalizado viaja en el backup (spec 5.6); el del
    // catálogo ya estaba en esta DB de origen y no se toca al reimportar.
    expect(allExercises.filter(e => e.isCustom)).toHaveLength(1);

    const sets =
      await setupResult.repositories.workoutSessions.listSetsBySession(
        backup.data.workoutSessions[0]?.id ?? '',
      );
    expect(sets).toHaveLength(1);
  });

  it('reenlaza un ejercicio del catálogo por nombre al importar en otra DB', async () => {
    const source = setup();
    await seedSourceData(source, 'ex-catalog-source');
    const backup = await source.service.buildBackup();

    const destination = setup();
    // Simula el catálogo reimportado en otro dispositivo: mismo nombre,
    // id distinto (ver `importExerciseCatalogIfNeeded`, que genera ids
    // random en cada instalación).
    await destination.db
      .insert(exercises)
      .values({ id: 'ex-catalog-dest', name: 'Sentadilla', isCustom: false });

    const result = await destination.service.importBackup(backup);

    expect(result.skippedExerciseRefs).toBe(0);
    const [importedPlanDayExercise] = await destination.db
      .select()
      .from(planDayExercises);
    expect(importedPlanDayExercise?.exerciseId).toBe('ex-catalog-dest');

    const importedSets =
      await destination.repositories.workoutSessions.listSetsByExercise(
        backup.data.users[0]?.id ?? '',
        'ex-catalog-dest',
      );
    expect(importedSets).toHaveLength(1);
  });

  it('omite (no rompe FK) las filas cuyo ejercicio del catálogo no existe ni coincide por nombre', async () => {
    const source = setup();
    await seedSourceData(source, 'ex-catalog-source');
    const backup = await source.service.buildBackup();

    // DB destino sin ningún catálogo importado todavía.
    const destination = setup();

    const result = await destination.service.importBackup(backup);

    expect(result.skippedExerciseRefs).toBeGreaterThan(0);
    expect(result.importedCounts.planDayExercises).toBe(0);
    expect(result.importedCounts.workoutSessionSets).toBe(0);
    // Lo que sí es dueño del usuario (plan, día, sesión, peso corporal,
    // ejercicio personalizado) se importa igual.
    expect(result.importedCounts.plans).toBe(1);
    expect(result.importedCounts.bodyWeightLogs).toBe(1);
  });

  it('la versión del backup se valida antes de importar', async () => {
    const { service } = setup();
    const invalid = { version: 2 } as unknown as BackupFile;

    await expect(service.importBackup(invalid)).rejects.toThrow();
  });
});
