import { createPlanDayExercisesRepository } from '../planDayExercisesRepository';
import { createPlanDaysRepository } from '../planDaysRepository';
import { createPlansRepository } from '../plansRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createUsersRepository } from '../usersRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const repo = createPlanDayExercisesRepository(db);
  const planDaysRepo = createPlanDaysRepository(db);
  const plansRepo = createPlansRepository(db);
  const exercisesRepo = createExercisesRepository(db);
  const usersRepo = createUsersRepository(db);

  const user = await usersRepo.getOrCreateLocalUser();
  const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
  const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
  await exercisesRepo.insertMany([
    { id: 'ex-1', name: 'Push Up' },
    { id: 'ex-2', name: 'Squat' },
    { id: 'ex-3', name: 'Row' },
  ]);

  return { repo, day };
}

describe('PlanDayExercisesRepository', () => {
  it('asigna orderIndex incremental automáticamente', async () => {
    const { repo, day } = await setup();

    const first = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });
    const second = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-2',
      targetSets: 4,
      targetReps: 8,
    });

    expect(first.orderIndex).toBe(0);
    expect(second.orderIndex).toBe(1);
  });

  it('listByDay devuelve los ejercicios ordenados por orderIndex', async () => {
    const { repo, day } = await setup();
    await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });
    await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-2',
      targetSets: 3,
      targetReps: 10,
    });

    const list = await repo.listByDay(day.id);
    expect(list.map(e => e.exerciseId)).toEqual(['ex-1', 'ex-2']);
  });

  it('update modifica series/reps/peso/descanso/notas sin tocar el resto', async () => {
    const { repo, day } = await setup();
    const created = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });

    await repo.update(created.id, {
      targetSets: 4,
      targetWeight: 60,
      notes: 'Subir peso',
    });

    const [found] = await repo.listByDay(day.id);
    expect(found?.targetSets).toBe(4);
    expect(found?.targetWeight).toBe(60);
    expect(found?.notes).toBe('Subir peso');
    expect(found?.targetReps).toBe(10);
    expect(found?.restSeconds).toBe(30);
  });

  it('remove borra un ejercicio puntual del día', async () => {
    const { repo, day } = await setup();
    const created = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });

    await repo.remove(created.id);

    expect(await repo.listByDay(day.id)).toEqual([]);
  });

  it('reorder reasigna orderIndex según el nuevo orden dado', async () => {
    const { repo, day } = await setup();
    const a = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-1',
      targetSets: 3,
      targetReps: 10,
    });
    const b = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-2',
      targetSets: 3,
      targetReps: 10,
    });
    const c = await repo.create({
      planDayId: day.id,
      exerciseId: 'ex-3',
      targetSets: 3,
      targetReps: 10,
    });

    await repo.reorder(day.id, [c.id, a.id, b.id]);

    const list = await repo.listByDay(day.id);
    expect(list.map(e => e.exerciseId)).toEqual(['ex-3', 'ex-1', 'ex-2']);
  });
});
