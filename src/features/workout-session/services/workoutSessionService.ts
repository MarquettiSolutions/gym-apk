import type { Repositories } from '../../../db/repositories';
import { assertDefined } from '../../../shared/utils/assert';
import { nowIso, startOfTodayIso } from '../../../shared/utils/dates';
import { DEFAULT_WEIGHT_UNIT } from '../constants';
import type {
  ExerciseProgress,
  PlanDayExercise,
  RecordSetInput,
  SessionDetail,
  TodayWorkout,
  WorkoutSessionSet,
} from '../types';

export function createWorkoutSessionService(repositories: Repositories) {
  async function getTodayWorkout(userId: string): Promise<TodayWorkout> {
    const plan = await repositories.plans.getActive(userId);
    if (!plan) {
      return { status: 'no-active-plan' };
    }

    // `weekday` se guarda 0-6 igual que `Date.prototype.getDay()` (spec 4.4 +
    // ver src/features/plans/constants.ts), así que "hoy" es directo.
    const today = new Date().getDay();
    const days = await repositories.planDays.listByPlan(plan.id);
    const day = days.find(d => d.weekday === today);
    if (!day) {
      return { status: 'rest-day', plan };
    }

    const dayExercises = await repositories.planDayExercises.listByDay(day.id);
    const exercisesDetail = await Promise.all(
      dayExercises.map(async planDayExercise => {
        const exercise = assertDefined(
          await repositories.exercises.getById(planDayExercise.exerciseId),
          'Ejercicio no encontrado',
        );
        return { planDayExercise, exercise };
      }),
    );

    const existingSession =
      await repositories.workoutSessions.getInProgressForPlanDay(
        userId,
        day.id,
        startOfTodayIso(),
      );

    return {
      status: 'ready',
      plan,
      day,
      exercises: exercisesDetail,
      existingSessionId: existingSession?.id ?? null,
    };
  }

  async function startSession(userId: string, planDayId: string) {
    const existing = await repositories.workoutSessions.getInProgressForPlanDay(
      userId,
      planDayId,
      startOfTodayIso(),
    );
    if (existing) {
      return existing;
    }
    return repositories.workoutSessions.create({ userId, planDayId });
  }

  // Última fila registrada por `setNumber` (append-only: la más reciente es
  // "el valor actual" de esa serie, ver workoutSessionsRepository).
  function latestByExerciseAndSet(
    sets: WorkoutSessionSet[],
  ): Map<string, WorkoutSessionSet> {
    const latest = new Map<string, WorkoutSessionSet>();
    for (const set of sets) {
      latest.set(`${set.planDayExerciseId}:${set.setNumber}`, set);
    }
    return latest;
  }

  async function buildExerciseProgress(
    userId: string,
    planDayExercise: PlanDayExercise,
    exercise: ExerciseProgress['exercise'],
    latestSets: Map<string, WorkoutSessionSet>,
  ): Promise<ExerciseProgress> {
    const sets = Array.from({ length: planDayExercise.targetSets }, (_, i) => {
      const setNumber = i + 1;
      return {
        setNumber,
        latest: latestSets.get(`${planDayExercise.id}:${setNumber}`) ?? null,
      };
    });
    const lastSet = await repositories.workoutSessions.getLastSetForExercise(
      userId,
      exercise.id,
    );
    return {
      planDayExercise,
      exercise,
      sets,
      suggestion: lastSet
        ? { repsDone: lastSet.repsDone, weightDone: lastSet.weightDone }
        : null,
    };
  }

  async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
    const session = assertDefined(
      await repositories.workoutSessions.getById(sessionId),
      'Sesión no encontrada',
    );
    const day = assertDefined(
      await repositories.planDays.getById(session.planDayId ?? ''),
      'Día del plan no encontrado',
    );
    const dayExercises = await repositories.planDayExercises.listByDay(day.id);
    const sets = await repositories.workoutSessions.listSetsBySession(
      sessionId,
    );
    const latestSets = latestByExerciseAndSet(sets);

    const exercises = await Promise.all(
      dayExercises.map(async planDayExercise => {
        const exercise = assertDefined(
          await repositories.exercises.getById(planDayExercise.exerciseId),
          'Ejercicio no encontrado',
        );
        return buildExerciseProgress(
          session.userId,
          planDayExercise,
          exercise,
          latestSets,
        );
      }),
    );

    return { session, day, exercises };
  }

  async function recordSet(
    sessionId: string,
    planDayExercise: PlanDayExercise,
    exerciseId: string,
    setNumber: number,
    input: RecordSetInput,
  ) {
    return repositories.workoutSessions.addSet({
      sessionId,
      planDayExerciseId: planDayExercise.id,
      exerciseId,
      setNumber,
      repsDone: input.skipped ? null : input.repsDone,
      weightDone: input.skipped ? null : input.weightDone,
      weightUnit: input.weightUnit,
      completedAt: input.skipped ? null : nowIso(),
      skipped: input.skipped,
    });
  }

  // "Omitir ejercicio" (spec 5.3): registra como salteada cada serie que
  // todavía no tenga un registro, sin tocar las que ya se completaron.
  async function skipRemainingSets(
    sessionId: string,
    exerciseProgress: ExerciseProgress,
  ) {
    for (const set of exerciseProgress.sets) {
      if (!set.latest) {
        await recordSet(
          sessionId,
          exerciseProgress.planDayExercise,
          exerciseProgress.exercise.id,
          set.setNumber,
          {
            repsDone: null,
            weightDone: null,
            weightUnit: DEFAULT_WEIGHT_UNIT,
            skipped: true,
          },
        );
      }
    }
  }

  async function finishSession(sessionId: string) {
    await repositories.workoutSessions.finish(sessionId, 'completed');
  }

  return {
    getTodayWorkout,
    startSession,
    getSessionDetail,
    recordSet,
    skipRemainingSets,
    finishSession,
  };
}

export type WorkoutSessionService = ReturnType<
  typeof createWorkoutSessionService
>;
