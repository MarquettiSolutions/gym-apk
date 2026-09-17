import { and, asc, desc, eq, gte } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { workoutSessions, workoutSessionSets } from '../schema';
import { assertDefined } from '../../shared/utils/assert';
import { nowIso } from '../../shared/utils/dates';

// Cubre `workout_sessions` y `workout_session_sets`. IMPORTANTE:
// `workout_session_sets` es append-only (ver spec 4.4) — este repositorio no
// expone ni debe exponer un método `update`/`delete` de series; cada serie
// registrada (o corregida, o saltada) es siempre un `insert` nuevo. Para
// saber el estado "actual" de una serie, la capa de servicio se queda con la
// fila más reciente de `listSetsBySession` para ese `setNumber`.
export interface WorkoutSessionsRepository {
  listByUser(
    userId: string,
  ): Promise<Array<typeof workoutSessions.$inferSelect>>;
  getById(id: string): Promise<typeof workoutSessions.$inferSelect | undefined>;
  // Sesión sin terminar para ese día del plan, empezada hoy — permite
  // "continuar" el entrenamiento si el usuario vuelve a abrir la app en vez
  // de arrancar una sesión duplicada.
  getInProgressForPlanDay(
    userId: string,
    planDayId: string,
    sinceIso: string,
  ): Promise<typeof workoutSessions.$inferSelect | undefined>;
  create(values: {
    userId: string;
    planDayId: string;
  }): Promise<typeof workoutSessions.$inferSelect>;
  // Único campo de `workout_sessions` que se actualiza in-place: la sesión
  // pasa de `in_progress` a `completed`/`skipped` una sola vez, nunca se
  // vuelve a tocar después (spec 4.4).
  finish(id: string, status: 'completed' | 'skipped'): Promise<void>;
  listSetsBySession(
    sessionId: string,
  ): Promise<Array<typeof workoutSessionSets.$inferSelect>>;
  // Última serie registrada (no salteada) para ese ejercicio, en cualquier
  // sesión pasada del usuario — se usa para sugerir peso/reps (spec 5.3).
  getLastSetForExercise(
    userId: string,
    exerciseId: string,
  ): Promise<typeof workoutSessionSets.$inferSelect | undefined>;
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
    async getById(id) {
      const [row] = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.id, id));
      return row;
    },
    async getInProgressForPlanDay(userId, planDayId, sinceIso) {
      const [row] = await db
        .select()
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.userId, userId),
            eq(workoutSessions.planDayId, planDayId),
            eq(workoutSessions.status, 'in_progress'),
            gte(workoutSessions.startedAt, sinceIso),
          ),
        )
        .orderBy(desc(workoutSessions.startedAt))
        .limit(1);
      return row;
    },
    async create(values) {
      const [created] = await db
        .insert(workoutSessions)
        .values(values)
        .returning();
      return assertDefined(created, 'No se pudo crear la sesión');
    },
    async finish(id, status) {
      await db
        .update(workoutSessions)
        .set({ finishedAt: nowIso(), status })
        .where(eq(workoutSessions.id, id));
    },
    async listSetsBySession(sessionId) {
      return db
        .select()
        .from(workoutSessionSets)
        .where(eq(workoutSessionSets.sessionId, sessionId))
        .orderBy(asc(workoutSessionSets.createdAt));
    },
    async getLastSetForExercise(userId, exerciseId) {
      const [row] = await db
        .select({ set: workoutSessionSets })
        .from(workoutSessionSets)
        .innerJoin(
          workoutSessions,
          eq(workoutSessionSets.sessionId, workoutSessions.id),
        )
        .where(
          and(
            eq(workoutSessions.userId, userId),
            eq(workoutSessionSets.exerciseId, exerciseId),
            eq(workoutSessionSets.skipped, false),
          ),
        )
        .orderBy(desc(workoutSessionSets.completedAt))
        .limit(1);
      return row?.set;
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
