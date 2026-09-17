import { and, asc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { planDayExercises } from '../schema';
import { assertDefined } from '../../shared/utils/assert';
import { nowIso } from '../../shared/utils/dates';

export interface PlanDayExercisesRepository {
  listByDay(
    planDayId: string,
  ): Promise<Array<typeof planDayExercises.$inferSelect>>;
  create(
    values: Omit<typeof planDayExercises.$inferInsert, 'orderIndex'> & {
      orderIndex?: number;
    },
  ): Promise<typeof planDayExercises.$inferSelect>;
  update(
    id: string,
    values: Partial<
      Pick<
        typeof planDayExercises.$inferInsert,
        'targetSets' | 'targetReps' | 'targetWeight' | 'restSeconds' | 'notes'
      >
    >,
  ): Promise<void>;
  remove(id: string): Promise<void>;
  reorder(planDayId: string, orderedIds: string[]): Promise<void>;
}

export function createPlanDayExercisesRepository(
  db: AppDatabase,
): PlanDayExercisesRepository {
  return {
    async listByDay(planDayId) {
      return db
        .select()
        .from(planDayExercises)
        .where(eq(planDayExercises.planDayId, planDayId))
        .orderBy(asc(planDayExercises.orderIndex));
    },
    async create(values) {
      let orderIndex = values.orderIndex;
      if (orderIndex === undefined) {
        const existing = await db
          .select()
          .from(planDayExercises)
          .where(eq(planDayExercises.planDayId, values.planDayId));
        orderIndex = existing.length;
      }
      const [created] = await db
        .insert(planDayExercises)
        .values({ ...values, orderIndex })
        .returning();
      return assertDefined(created, 'No se pudo agregar el ejercicio al día');
    },
    async update(id, values) {
      await db
        .update(planDayExercises)
        .set({ ...values, updatedAt: nowIso() })
        .where(eq(planDayExercises.id, id));
    },
    async remove(id) {
      await db.delete(planDayExercises).where(eq(planDayExercises.id, id));
    },
    async reorder(planDayId, orderedIds) {
      for (const [index, id] of orderedIds.entries()) {
        await db
          .update(planDayExercises)
          .set({ orderIndex: index, updatedAt: nowIso() })
          .where(
            and(
              eq(planDayExercises.id, id),
              eq(planDayExercises.planDayId, planDayId),
            ),
          );
      }
    },
  };
}
