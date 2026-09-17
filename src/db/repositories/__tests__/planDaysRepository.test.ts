import { createPlanDaysRepository } from '../planDaysRepository';
import { createPlanDayExercisesRepository } from '../planDayExercisesRepository';
import { createPlansRepository } from '../plansRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createUsersRepository } from '../usersRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const planDaysRepo = createPlanDaysRepository(db);
  const planDayExercisesRepo = createPlanDayExercisesRepository(db);
  const plansRepo = createPlansRepository(db);
  const exercisesRepo = createExercisesRepository(db);
  const usersRepo = createUsersRepository(db);

  const user = await usersRepo.getOrCreateLocalUser();
  const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
  await exercisesRepo.insertMany([{ id: 'ex-1', name: 'Push Up' }]);

  return { planDaysRepo, planDayExercisesRepo, plan };
}

describe('PlanDaysRepository', () => {
  it('crea días y los lista ordenados por día de la semana', async () => {
    const { planDaysRepo, plan } = await setup();

    await planDaysRepo.create({
      planId: plan.id,
      weekday: 5,
      label: 'Piernas',
    });
    await planDaysRepo.create({ planId: plan.id, weekday: 1, label: 'Empuje' });

    const days = await planDaysRepo.listByPlan(plan.id);
    expect(days.map(d => d.weekday)).toEqual([1, 5]);
  });

  it('update actualiza weekday y label', async () => {
    const { planDaysRepo, plan } = await setup();
    const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });

    await planDaysRepo.update(day.id, { weekday: 3, label: 'Tirón' });

    const found = await planDaysRepo.getById(day.id);
    expect(found?.weekday).toBe(3);
    expect(found?.label).toBe('Tirón');
  });

  it('remove borra el día y sus ejercicios asociados', async () => {
    const { planDaysRepo, planDayExercisesRepo, plan } = await setup();
    const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
    await planDayExercisesRepo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });

    await planDaysRepo.remove(day.id);

    expect(await planDaysRepo.getById(day.id)).toBeUndefined();
    expect(await planDayExercisesRepo.listByDay(day.id)).toEqual([]);
  });
});
