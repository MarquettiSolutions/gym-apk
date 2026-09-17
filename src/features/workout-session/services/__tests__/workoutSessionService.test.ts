import { createRepositories } from '../../../../db/repositories';
import { createTestDb } from '../../../../db/repositories/testDb';
import { createWorkoutSessionService } from '../workoutSessionService';

const TODAY_WEEKDAY = new Date().getDay();
const OTHER_WEEKDAY = (TODAY_WEEKDAY + 1) % 7;

async function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const service = createWorkoutSessionService(repositories);
  const user = await repositories.users.getOrCreateLocalUser();
  await repositories.exercises.insertMany([
    { id: 'ex-1', name: 'Push Up' },
    { id: 'ex-2', name: 'Squat' },
  ]);
  return { service, repositories, user };
}

async function setupActivePlanForToday() {
  const { service, repositories, user } = await setup();
  const plan = await repositories.plans.create({
    userId: user.id,
    name: 'Fuerza',
  });
  await repositories.plans.setActive(user.id, plan.id);
  const day = await repositories.planDays.create({
    planId: plan.id,
    weekday: TODAY_WEEKDAY,
  });
  await repositories.planDayExercises.create({
    planDayId: day.id,
    exerciseId: 'ex-1',
    targetSets: 3,
    targetReps: 10,
  });
  return { service, repositories, user, plan, day };
}

describe('workoutSessionService', () => {
  it('getTodayWorkout devuelve no-active-plan si el usuario no tiene plan activo', async () => {
    const { service, user } = await setup();

    const workout = await service.getTodayWorkout(user.id);

    expect(workout.status).toBe('no-active-plan');
  });

  it('getTodayWorkout devuelve rest-day si el plan activo no entrena hoy', async () => {
    const { service, repositories, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    await repositories.plans.setActive(user.id, plan.id);
    await repositories.planDays.create({
      planId: plan.id,
      weekday: OTHER_WEEKDAY,
    });

    const workout = await service.getTodayWorkout(user.id);

    expect(workout.status).toBe('rest-day');
  });

  it('getTodayWorkout devuelve ready con los ejercicios del día si hoy toca entrenar', async () => {
    const { service, user } = await setupActivePlanForToday();

    const workout = await service.getTodayWorkout(user.id);

    expect(workout.status).toBe('ready');
    if (workout.status === 'ready') {
      expect(workout.exercises).toHaveLength(1);
      expect(workout.exercises[0]?.exercise.name).toBe('Push Up');
      expect(workout.existingSessionId).toBeNull();
    }
  });

  it('startSession resume la sesión sin terminar del mismo día en vez de duplicarla', async () => {
    const { service, user, day } = await setupActivePlanForToday();

    const first = await service.startSession(user.id, day.id);
    const second = await service.startSession(user.id, day.id);

    expect(second.id).toBe(first.id);
  });

  it('getSessionDetail arma las series pendientes según targetSets y sugiere el último registro', async () => {
    const { service, repositories, user, day } =
      await setupActivePlanForToday();
    const oldSession = await repositories.workoutSessions.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repositories.workoutSessions.addSet({
      sessionId: oldSession.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 12,
      weightDone: 35,
      completedAt: new Date().toISOString(),
    });

    const session = await service.startSession(user.id, day.id);
    const detail = await service.getSessionDetail(session.id);

    expect(detail.exercises).toHaveLength(1);
    const exerciseProgress = detail.exercises[0]!;
    expect(exerciseProgress.sets).toHaveLength(3);
    expect(exerciseProgress.sets.every(s => s.latest === null)).toBe(true);
    expect(exerciseProgress.suggestion).toEqual({
      repsDone: 12,
      weightDone: 35,
    });
  });

  it('recordSet es append-only: una corrección se ve reflejada sin perder la fila anterior', async () => {
    const { service, user, day } = await setupActivePlanForToday();
    const session = await service.startSession(user.id, day.id);
    let detail = await service.getSessionDetail(session.id);
    const exerciseProgress = detail.exercises[0]!;

    await service.recordSet(
      session.id,
      exerciseProgress.planDayExercise,
      exerciseProgress.exercise.id,
      1,
      { repsDone: 8, weightDone: 40, weightUnit: 'kg', skipped: false },
    );
    await service.recordSet(
      session.id,
      exerciseProgress.planDayExercise,
      exerciseProgress.exercise.id,
      1,
      { repsDone: 10, weightDone: 45, weightUnit: 'kg', skipped: false },
    );

    detail = await service.getSessionDetail(session.id);
    const set1 = detail.exercises[0]!.sets.find(s => s.setNumber === 1);
    expect(set1?.latest?.weightDone).toBe(45);
  });

  it('skipRemainingSets salta solo las series todavía no registradas del ejercicio', async () => {
    const { service, user, day } = await setupActivePlanForToday();
    const session = await service.startSession(user.id, day.id);
    let detail = await service.getSessionDetail(session.id);
    const exerciseProgress = detail.exercises[0]!;

    await service.recordSet(
      session.id,
      exerciseProgress.planDayExercise,
      exerciseProgress.exercise.id,
      1,
      { repsDone: 10, weightDone: 40, weightUnit: 'kg', skipped: false },
    );
    detail = await service.getSessionDetail(session.id);

    await service.skipRemainingSets(session.id, detail.exercises[0]!);
    detail = await service.getSessionDetail(session.id);

    const sets = detail.exercises[0]!.sets;
    expect(sets[0]?.latest?.skipped).toBe(false);
    expect(sets[1]?.latest?.skipped).toBe(true);
    expect(sets[2]?.latest?.skipped).toBe(true);
  });

  it('finishSession marca la sesión como completada', async () => {
    const { service, user, day, repositories } =
      await setupActivePlanForToday();
    const session = await service.startSession(user.id, day.id);

    await service.finishSession(session.id);

    const found = await repositories.workoutSessions.getById(session.id);
    expect(found?.status).toBe('completed');
    expect(found?.finishedAt).not.toBeNull();
  });
});
