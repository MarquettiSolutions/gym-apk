import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../schema';
import type { AppDatabase } from '../types';

// DB en memoria para tests de repositorios, corriendo las mismas migraciones
// generadas por `drizzle-kit` que usa producción (op-sqlite) — valida el
// esquema real, no una versión aparte para tests.
export function createTestDb(): AppDatabase {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: './src/db/migrations' });
  return db as unknown as AppDatabase;
}
