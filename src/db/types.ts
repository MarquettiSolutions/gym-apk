import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type * as schema from './schema';

// Tipo común que aceptan ambos drivers: op-sqlite (async, producción) y
// better-sqlite3 (sync, tests en memoria) — así los repositorios se escriben
// una sola vez y reciben la instancia de `db` por parámetro sin importar cuál
// de los dos backends la creó.
export type AppDatabase = BaseSQLiteDatabase<
  'sync' | 'async',
  unknown,
  typeof schema
>;
