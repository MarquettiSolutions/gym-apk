import { asc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { planDays, planDayExercises, workoutSessions } from '../schema';
import { assertDefined } from '../../shared/utils/assert';
import { nowIso } from '../../shared/utils/dates';

export interface PlanDaysRepository {
  listByPlan(planId: string): Promise<Array<typeof planDays.$inferSelect>>;
  getById(id: string): Promise<typeof planDays.$inferSelect | undefined>;
  create(values: {
    planId: string;
    weekday: number;
    label?: string | null;
  }): Promise<typeof planDays.$inferSelect>;
  update(
    id: string,
    values: { weekday?: number; label?: string | null },
  ): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createPlanDaysRepository(db: AppDatabase): PlanDaysRepository {
  return {
    async listByPlan(planId) {
      return db
        .select()
        .from(planDays)
        .where(eq(planDays.planId, planId))
        .orderBy(asc(planDays.weekday));
    },
    async getById(id) {
      const [row] = await db.select().from(planDays).where(eq(planDays.id, id));
      return row;
    },
    async create(values) {
      const [created] = await db.insert(planDays).values(values).returning();
      return assertDefined(created, 'No se pudo crear el día del plan');
    },
    async update(id, values) {
      await db
        .update(planDays)
        .set({ ...values, updatedAt: nowIso() })
        .where(eq(planDays.id, id));
    },
    async remove(id) {
      // Sin ON DELETE CASCADE en el esquema (spec 4.3): borra primero los
      // ejercicios de ese día. Las sesiones históricas de ese día quedan
      // con `plan_day_id = null` en vez de borrarse (spec 4.4: el
      // historial sobrevive al borrado del plan de origen).
      await db
        .update(workoutSessions)
        .set({ planDayId: null })
        .where(eq(workoutSessions.planDayId, id));
      await db
        .delete(planDayExercises)
        .where(eq(planDayExercises.planDayId, id));
      await db.delete(planDays).where(eq(planDays.id, id));
    },
  };
}
