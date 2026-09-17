import { and, eq, inArray, ne } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { plans, planDays, planDayExercises, workoutSessions } from '../schema';
import { assertDefined } from '../../shared/utils/assert';
import { nowIso } from '../../shared/utils/dates';

// Cubre `plans`. El CRUD de `plan_days`/`plan_day_exercises` (wizard de
// armado del plan) vive en `planDaysRepository`/`planDayExercisesRepository`.
export interface PlansRepository {
  listByUser(userId: string): Promise<Array<typeof plans.$inferSelect>>;
  getById(id: string): Promise<typeof plans.$inferSelect | undefined>;
  getActive(userId: string): Promise<typeof plans.$inferSelect | undefined>;
  create(values: {
    userId: string;
    name: string;
  }): Promise<typeof plans.$inferSelect>;
  rename(id: string, name: string): Promise<void>;
  setActive(userId: string, id: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createPlansRepository(db: AppDatabase): PlansRepository {
  return {
    async listByUser(userId) {
      return db.select().from(plans).where(eq(plans.userId, userId));
    },
    async getById(id) {
      const [row] = await db.select().from(plans).where(eq(plans.id, id));
      return row;
    },
    async getActive(userId) {
      const [active] = await db
        .select()
        .from(plans)
        .where(and(eq(plans.userId, userId), eq(plans.isActive, true)));
      return active;
    },
    async create(values) {
      const [created] = await db.insert(plans).values(values).returning();
      return assertDefined(created, 'No se pudo crear el plan');
    },
    async rename(id, name) {
      await db
        .update(plans)
        .set({ name, updatedAt: nowIso() })
        .where(eq(plans.id, id));
    },
    async setActive(userId, id) {
      // Un solo plan activo a la vez (spec 11): desactiva el resto de los
      // planes del usuario antes de activar el elegido.
      await db
        .update(plans)
        .set({ isActive: false, updatedAt: nowIso() })
        .where(and(eq(plans.userId, userId), ne(plans.id, id)));
      await db
        .update(plans)
        .set({ isActive: true, updatedAt: nowIso() })
        .where(eq(plans.id, id));
    },
    async remove(id) {
      // Sin ON DELETE CASCADE en el esquema (spec 4.3): se borra a mano de
      // abajo hacia arriba (ejercicios del día -> días -> plan). Las
      // sesiones históricas de esos días quedan con `plan_day_id = null`
      // en vez de borrarse (spec 4.4: el historial sobrevive al borrado
      // del plan de origen).
      const days = await db
        .select({ id: planDays.id })
        .from(planDays)
        .where(eq(planDays.planId, id));
      const dayIds = days.map(day => day.id);
      if (dayIds.length > 0) {
        await db
          .update(workoutSessions)
          .set({ planDayId: null })
          .where(inArray(workoutSessions.planDayId, dayIds));
      }
      for (const day of days) {
        await db
          .delete(planDayExercises)
          .where(eq(planDayExercises.planDayId, day.id));
      }
      await db.delete(planDays).where(eq(planDays.planId, id));
      await db.delete(plans).where(eq(plans.id, id));
    },
  };
}
