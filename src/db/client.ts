import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import * as schema from './schema';
import migrations from './migrations/migrations';
import { createRepositories } from './repositories';
import { importExerciseCatalogIfNeeded } from '../catalog/importCatalog';
import { backfillExerciseVideoUrlsIfNeeded } from '../catalog/videoUrlBackfill';

const opsqlite = open({ name: 'gymapk.db' });

export const db = drizzle(opsqlite, { schema });
export const repositories = createRepositories(db);

let initPromise: Promise<void> | null = null;
let catalogImportPromise: Promise<void> | null = null;

// Solo lo imprescindible para que la app sea usable: migrar el schema y
// asegurar el usuario local. Antes esto también esperaba el catálogo de
// ejercicios completo (fetch + miniaturas), lo que dejaba la UI trabada en
// "Loading..." varios segundos en el primer arranque (issue #54). El
// catálogo ahora se puebla en segundo plano con `importCatalogInBackground`.
export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await opsqlite.execute('PRAGMA foreign_keys = ON;');
      await migrate(db, migrations);
      await repositories.users.getOrCreateLocalUser();
    })();
  }
  return initPromise;
}

// Llamar solo después de que `initDatabase()` resolvió (necesita el schema
// ya migrado). No bloquea: las pantallas que leen la tabla `exercises` se
// refrescan solas vía `catalogEvents` a medida que entran filas.
export function importCatalogInBackground(): Promise<void> {
  if (!catalogImportPromise) {
    catalogImportPromise = (async () => {
      await importExerciseCatalogIfNeeded(repositories);
      await backfillExerciseVideoUrlsIfNeeded(repositories);
    })();
  }
  return catalogImportPromise;
}
