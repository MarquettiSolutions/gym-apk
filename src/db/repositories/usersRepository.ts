import type { AppDatabase } from '../types';
import { users } from '../schema';
import { assertDefined } from '../../shared/utils/assert';

export interface UsersRepository {
  getOrCreateLocalUser(): Promise<typeof users.$inferSelect>;
}

export function createUsersRepository(db: AppDatabase): UsersRepository {
  return {
    async getOrCreateLocalUser() {
      const [existing] = await db.select().from(users).limit(1);
      if (existing) {
        return existing;
      }
      const [created] = await db.insert(users).values({}).returning();
      return assertDefined(created, 'No se pudo crear el usuario local');
    },
  };
}
