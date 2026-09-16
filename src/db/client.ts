import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import * as schema from './schema';
import { users } from './schema';
import migrations from './migrations/migrations';

const LOCAL_USER_DISPLAY_NAME = 'Usuario local';

const opsqlite = open({ name: 'gymapk.db' });

export const db = drizzle(opsqlite, { schema });

let initPromise: Promise<void> | null = null;

export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await opsqlite.execute('PRAGMA foreign_keys = ON;');
      await migrate(db, migrations);
      await seedLocalUser();
    })();
  }
  return initPromise;
}

async function seedLocalUser(): Promise<void> {
  const existing = await db.select().from(users).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values({ displayName: LOCAL_USER_DISPLAY_NAME });
  }
}
