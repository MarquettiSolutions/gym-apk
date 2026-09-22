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

export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await opsqlite.execute('PRAGMA foreign_keys = ON;');
      await migrate(db, migrations);
      await repositories.users.getOrCreateLocalUser();
      await importExerciseCatalogIfNeeded(repositories);
      await backfillExerciseVideoUrlsIfNeeded(repositories);
    })();
  }
  return initPromise;
}
