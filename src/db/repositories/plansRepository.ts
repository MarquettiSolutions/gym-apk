import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { plans } from '../schema';

// Cubre `plans`. La gestión de `plan_days`/`plan_day_exercises` (CRUD del
// wizard de armado del plan) se implementa en Fase 2.
export interface PlansRepository {
  listByUser(userId: string): Promise<Array<typeof plans.$inferSelect>>;
  getActive(userId: string): Promise<typeof plans.$inferSelect | undefined>;
}

export function createPlansRepository(db: AppDatabase): PlansRepository {
  return {
    async listByUser(userId) {
      return db.select().from(plans).where(eq(plans.userId, userId));
    },
    async getActive(userId) {
      const [active] = await db
        .select()
        .from(plans)
        .where(and(eq(plans.userId, userId), eq(plans.isActive, true)));
      return active;
    },
  };
}
