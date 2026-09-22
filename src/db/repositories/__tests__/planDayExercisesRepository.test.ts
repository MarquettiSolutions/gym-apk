import { createPlanDayExercisesRepository } from '../planDayExercisesRepository';
import { createPlanDaysRepository } from '../planDaysRepository';
import { createPlansRepository } from '../plansRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createUsersRepository } from '../usersRepository';
import { createWorkoutSessionsRepository } from '../workoutSessionsRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const repo = createPlanDayExercisesRepository(db);
  const planDaysRepo = createPlanDaysRepository(db);
  const plansRepo = createPlansRepository(db);
  const exercisesRepo = createExercisesRepository(db);
  const usersRepo = createUsersRepository(db);
  const sessionsRepo = createWorkoutSessionsRepository(db);

  const user = await usersRepo.getOrCreateLocalUser();
  const plan = await plansRepo.create({ userId: user.id, name: 'Fuerza' });
  const day = await planDaysRepo.create({ planId: plan.id, weekday: 1 });
  await exercisesRepo.insertMany([
    { id: 'ex-1', name: 'Push Up' },
    { id: 'ex-2', name: 'Squat' },
    { id: 'ex-3', name: 'Row' },
  ]);

  return { repo, day, user, sessionsRepo };
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

  it('remove no rompe si el ejercicio ya tiene series de sesión registradas (incluso omitidas)', async () => {
    const { repo, day, user, sessionsRepo } = await setup();
    const created = await repo.create({
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
      planDayExerciseId: created.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      skipped: true,
    });

    await expect(repo.remove(created.id)).resolves.not.toThrow();

    expect(await repo.listByDay(day.id)).toEqual([]);
    const [set] = await sessionsRepo.listSetsBySession(session.id);
    expect(set?.planDayExerciseId).toBeNull();
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

  it('setSupersetGroup asigna el groupId a los ids indicados sin tocar el resto', async () => {
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

    await repo.setSupersetGroup([a.id, b.id], 'group-1');

    const list = await repo.listByDay(day.id);
    expect(list.find(e => e.id === a.id)?.supersetGroupId).toBe('group-1');
    expect(list.find(e => e.id === b.id)?.supersetGroupId).toBe('group-1');
    expect(list.find(e => e.id === c.id)?.supersetGroupId).toBeNull();
  });

  it('setSupersetGroup con groupId null desagrupa los ids indicados', async () => {
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
    await repo.setSupersetGroup([a.id, b.id], 'group-1');

    await repo.setSupersetGroup([a.id, b.id], null);

    const list = await repo.listByDay(day.id);
    expect(list.every(e => e.supersetGroupId === null)).toBe(true);
  });
});
