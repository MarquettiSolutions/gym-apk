import type { Repositories } from '../../../db/repositories';
import { assertDefined } from '../../../shared/utils/assert';
import { getActiveTranslations } from '../../../shared/i18n/activeLanguage';
import type {
  ExerciseProgress,
  SessionDetailExercise,
  SessionHistoryDetail,
  SessionSummary,
  StreakInfo,
  WorkoutSessionSet,
} from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Fecha local (sin hora) en formato `YYYY-MM-DD`, para agrupar/comparar días
// de calendario sin depender de la hora exacta del registro.
function toLocalDateKey(iso: string): string {
  const date = new Date(iso);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toISOString();
}

export function createHistoryService(repositories: Repositories) {
  async function resolveDayLabel(
    planDayId: string | null,
  ): Promise<string | null> {
    if (!planDayId) {
      return null;
    }
    const day = await repositories.planDays.getById(planDayId);
    if (!day) {
      return null;
    }
    return day.label ?? getActiveTranslations().weekdays[day.weekday] ?? null;
  }

  async function listSessions(userId: string): Promise<SessionSummary[]> {
    const sessions = await repositories.workoutSessions.listByUser(userId);
    return Promise.all(
      sessions.map(async session => {
        const sets = await repositories.workoutSessions.listSetsBySession(
          session.id,
        );
        const latestBySet = new Map<string, WorkoutSessionSet>();
        for (const set of sets) {
          latestBySet.set(`${set.exerciseId}:${set.setNumber}`, set);
        }
        const latest = Array.from(latestBySet.values());
        return {
          session,
          dayLabel: await resolveDayLabel(session.planDayId),
          totalSets: latest.length,
          completedSets: latest.filter(set => !set.skipped).length,
        };
      }),
    );
  }

  async function getSessionDetail(
    sessionId: string,
  ): Promise<SessionHistoryDetail> {
    const session = assertDefined(
      await repositories.workoutSessions.getById(sessionId),
      'Sesión no encontrada',
    );
    const sets = await repositories.workoutSessions.listSetsBySession(
      sessionId,
    );

    // Última fila por ejercicio+serie (append-only, ver
    // workoutSessionsRepository), agrupadas en el orden en que se registró
    // cada ejercicio por primera vez durante la sesión.
    const latestBySet = new Map<string, WorkoutSessionSet>();
    const exerciseOrder: string[] = [];
    for (const set of sets) {
      if (!latestBySet.has(`${set.exerciseId}:${set.setNumber}`)) {
        if (!exerciseOrder.includes(set.exerciseId)) {
          exerciseOrder.push(set.exerciseId);
        }
      }
      latestBySet.set(`${set.exerciseId}:${set.setNumber}`, set);
    }

    const exercises: SessionDetailExercise[] = await Promise.all(
      exerciseOrder.map(async exerciseId => {
        const exercise = assertDefined(
          await repositories.exercises.getById(exerciseId),
          'Ejercicio no encontrado',
        );
        const exerciseSets = Array.from(latestBySet.values())
          .filter(set => set.exerciseId === exerciseId)
          .sort((a, b) => a.setNumber - b.setNumber);
        return { exercise, sets: exerciseSets };
      }),
    );

    return {
      session,
      dayLabel: await resolveDayLabel(session.planDayId),
      exercises,
    };
  }

  async function getExerciseProgress(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseProgress> {
    const exercise = assertDefined(
      await repositories.exercises.getById(exerciseId),
      'Ejercicio no encontrado',
    );
    const sets = await repositories.workoutSessions.listSetsByExercise(
      userId,
      exerciseId,
    );
    const withDate = (
      set: WorkoutSessionSet,
    ): set is WorkoutSessionSet & { completedAt: string } =>
      set.completedAt !== null;

    return {
      exercise,
      points: sets.filter(withDate).map(set => ({
        date: set.completedAt,
        weightDone: set.weightDone,
        weightUnit: set.weightUnit,
        repsDone: set.repsDone,
      })),
    };
  }

  // Racha de días entrenados (spec 5.4): cuenta días de calendario
  // consecutivos con al menos una sesión completada, terminando hoy o ayer
  // (si hoy todavía no se entrenó, no corta la racha de días anteriores).
  async function getStreak(userId: string): Promise<StreakInfo> {
    const sessions = await repositories.workoutSessions.listByUser(userId);
    const trainedDayKeys = new Set(
      sessions
        .filter(session => session.status === 'completed')
        .map(session =>
          toLocalDateKey(session.finishedAt ?? session.startedAt),
        ),
    );

    if (trainedDayKeys.size === 0) {
      return { days: 0 };
    }

    const todayKey = toLocalDateKey(new Date().toISOString());
    let cursor = new Date(todayKey);
    if (!trainedDayKeys.has(cursor.toISOString())) {
      cursor = new Date(cursor.getTime() - MS_PER_DAY);
    }

    let days = 0;
    while (trainedDayKeys.has(cursor.toISOString())) {
      days += 1;
      cursor = new Date(cursor.getTime() - MS_PER_DAY);
    }
    return { days };
  }

  return {
    listSessions,
    getSessionDetail,
    getExerciseProgress,
    getStreak,
  };
}

export type HistoryService = ReturnType<typeof createHistoryService>;
