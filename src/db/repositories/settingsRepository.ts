import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { settings } from '../schema';

// Única tabla mutable in-place (ver spec 4.4): representa preferencias
// actuales, no hechos históricos.
export interface SettingsRepository {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
}

export function createSettingsRepository(db: AppDatabase): SettingsRepository {
  return {
    async get(key) {
      const [row] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key));
      return row?.value;
    },
    async set(key, value) {
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } });
    },
  };
}
