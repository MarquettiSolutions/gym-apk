import { createPlansRepository } from '../plansRepository';
import { createPlanDaysRepository } from '../planDaysRepository';
import { createPlanDayExercisesRepository } from '../planDayExercisesRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createUsersRepository } from '../usersRepository';
import { createWorkoutSessionsRepository } from '../workoutSessionsRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const plansRepo = createPlansRepository(db);
  const planDaysRepo = createPlanDaysRepository(db);
  const planDayExercisesRepo = createPlanDayExercisesRepository(db);
  const exercisesRepo = createExercisesRepository(db);
  const usersRepo = createUsersRepository(db);

  const sessionsRepo = createWorkoutSessionsRepository(db);

  const user = await usersRepo.getOrCreateLocalUser();
  await exercisesRepo.insertMany([{ id: 'ex-1', name: 'Push Up' }]);

  return { plansRepo, planDaysRepo, planDayExercisesRepo, sessionsRepo, user };
}

describe('PlansRepository', () => {
  it('crea un plan y lo lista para su usuario', async () => {
    const { plansRepo, user } = await setup();

    const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });

    expect(plan.isActive).toBe(false);
    expect(await plansRepo.listByUser(user.id)).toEqual([plan]);
  });

  it('rename actualiza el nombre', async () => {
    const { plansRepo, user } = await setup();
    const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });

    await plansRepo.rename(plan.id, 'Hipertrofia');

    const found = await plansRepo.getById(plan.id);
    expect(found?.name).toBe('Hipertrofia');
  });

  it('setActive activa un plan y desactiva los demás del mismo usuario', async () => {
    const { plansRepo, user } = await setup();
    const planA = await plansRepo.create({ userId: user.id, name: 'A' });
    const planB = await plansRepo.create({ userId: user.id, name: 'B' });

    await plansRepo.setActive(user.id, planA.id);
    expect((await plansRepo.getActive(user.id))?.id).toBe(planA.id);

    await plansRepo.setActive(user.id, planB.id);
    expect((await plansRepo.getActive(user.id))?.id).toBe(planB.id);
    expect((await plansRepo.getById(planA.id))?.isActive).toBe(false);
  });

  it('remove borra el plan junto con sus días y ejercicios', async () => {
    const { plansRepo, planDaysRepo, planDayExercisesRepo, user } =
      await setup();
    const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
    const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
    await planDayExercisesRepo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });

    await plansRepo.remove(plan.id);

    expect(await plansRepo.getById(plan.id)).toBeUndefined();
    expect(await planDaysRepo.listByPlan(plan.id)).toEqual([]);
    expect(await planDayExercisesRepo.listByDay(day.id)).toEqual([]);
  });

  it('remove no rompe si alguno de sus ejercicios ya tiene series de sesión registradas (incluso omitidas)', async () => {
    const {
      plansRepo,
      planDaysRepo,
      planDayExercisesRepo,
      sessionsRepo,
      user,
    } = await setup();
    const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
    const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
    const dayExercise = await planDayExercisesRepo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });
    const session = await sessionsRepo.create({
      userId: user.id,
      planDayId: day.id,
    });
    await sessionsRepo.addSet({
      sessionId: session.id,
      planDayExerciseId: dayExercise.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      skipped: true,
    });

    await expect(plansRepo.remove(plan.id)).resolves.not.toThrow();

    expect(await plansRepo.getById(plan.id)).toBeUndefined();
    const [set] = await sessionsRepo.listSetsBySession(session.id);
    expect(set?.planDayExerciseId).toBeNull();
  });
});
