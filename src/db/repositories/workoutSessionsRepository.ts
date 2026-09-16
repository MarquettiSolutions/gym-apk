import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { workoutSessions, workoutSessionSets } from '../schema';
import { assertDefined } from '../../shared/utils/assert';

// Cubre `workout_sessions` y `workout_session_sets`. IMPORTANTE:
// `workout_session_sets` es append-only (ver spec 4.4) — este repositorio no
// expone ni debe exponer un método `update`/`delete` de series; cada serie
// registrada es siempre un `insert` nuevo.
export interface WorkoutSessionsRepository {
  listByUser(
    userId: string,
  ): Promise<Array<typeof workoutSessions.$inferSelect>>;
  addSet(
    values: typeof workoutSessionSets.$inferInsert,
  ): Promise<typeof workoutSessionSets.$inferSelect>;
}

export function createWorkoutSessionsRepository(
  db: AppDatabase,
): WorkoutSessionsRepository {
  return {
    async listByUser(userId) {
      return db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.userId, userId));
    },
    async addSet(values) {
      const [created] = await db
        .insert(workoutSessionSets)
        .values(values)
        .returning();
      return assertDefined(created, 'No se pudo registrar la serie');
    },
  };
}
