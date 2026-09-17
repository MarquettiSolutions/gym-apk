import { createWorkoutSessionsRepository } from '../workoutSessionsRepository';
import { createPlanDaysRepository } from '../planDaysRepository';
import { createPlansRepository } from '../plansRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createUsersRepository } from '../usersRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const repo = createWorkoutSessionsRepository(db);
  const planDaysRepo = createPlanDaysRepository(db);
  const plansRepo = createPlansRepository(db);
  const exercisesRepo = createExercisesRepository(db);
  const usersRepo = createUsersRepository(db);

  const user = await usersRepo.getOrCreateLocalUser();
  const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
  const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
  await exercisesRepo.insertMany([{ id: 'ex-1', name: 'Push Up' }]);

  return { repo, user, day };
}

describe('WorkoutSessionsRepository', () => {
  it('create arranca la sesión como in_progress y getById la encuentra', async () => {
    const { repo, user, day } = await setup();

    const session = await repo.create({ userId: user.id, planDayId: day.id });

    expect(session.status).toBe('in_progress');
    expect(session.finishedAt).toBeNull();
    expect(await repo.getById(session.id)).toMatchObject({ id: session.id });
  });

  it('getInProgressForPlanDay encuentra una sesión sin terminar empezada hoy', async () => {
    const { repo, user, day } = await setup();
    const session = await repo.create({ userId: user.id, planDayId: day.id });

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const found = await repo.getInProgressForPlanDay(
      user.id,
      day.id,
      yesterday,
    );

    expect(found?.id).toBe(session.id);
  });

  it('getInProgressForPlanDay ignora sesiones sin terminar de días anteriores', async () => {
    const { repo, user, day } = await setup();
    await repo.create({ userId: user.id, planDayId: day.id });

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const found = await repo.getInProgressForPlanDay(user.id, day.id, tomorrow);

    expect(found).toBeUndefined();
  });

  it('getInProgressForPlanDay ignora sesiones ya finalizadas', async () => {
    const { repo, user, day } = await setup();
    const session = await repo.create({ userId: user.id, planDayId: day.id });
    await repo.finish(session.id, 'completed');

    const sinceStart = new Date(Date.now() - 1000).toISOString();
    const found = await repo.getInProgressForPlanDay(
      user.id,
      day.id,
      sinceStart,
    );

    expect(found).toBeUndefined();
  });

  it('finish marca la sesión como completada y setea finishedAt', async () => {
    const { repo, user, day } = await setup();
    const session = await repo.create({ userId: user.id, planDayId: day.id });

    await repo.finish(session.id, 'completed');

    const found = await repo.getById(session.id);
    expect(found?.status).toBe('completed');
    expect(found?.finishedAt).not.toBeNull();
  });

  it('addSet es append-only: registrar una corrección agrega una fila nueva sin borrar la anterior', async () => {
    const { repo, user, day } = await setup();
    const session = await repo.create({ userId: user.id, planDayId: day.id });

    await repo.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 8,
      weightDone: 40,
      completedAt: new Date().toISOString(),
    });
    await repo.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 10,
      weightDone: 45,
      completedAt: new Date().toISOString(),
    });

    const sets = await repo.listSetsBySession(session.id);
    expect(sets).toHaveLength(2);
    expect(sets.map(s => s.weightDone)).toEqual([40, 45]);
  });

  it('getLastSetForExercise devuelve la serie no salteada más reciente entre todas las sesiones del usuario', async () => {
    const { repo, user, day } = await setup();
    const olderSession = await repo.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repo.addSet({
      sessionId: olderSession.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 8,
      weightDone: 40,
      completedAt: '2026-01-01T00:00:00.000Z',
    });

    const newerSession = await repo.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repo.addSet({
      sessionId: newerSession.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 10,
      weightDone: 50,
      completedAt: '2026-02-01T00:00:00.000Z',
    });
    await repo.addSet({
      sessionId: newerSession.id,
      exerciseId: 'ex-1',
      setNumber: 2,
      skipped: true,
      completedAt: null,
    });

    const last = await repo.getLastSetForExercise(user.id, 'ex-1');

    expect(last?.weightDone).toBe(50);
  });
});
