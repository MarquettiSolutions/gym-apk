import { createRepositories } from '../../../../db/repositories';
import { createTestDb } from '../../../../db/repositories/testDb';
import { createPlansService } from '../plansService';

async function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const service = createPlansService(repositories);
  const user = await repositories.users.getOrCreateLocalUser();
  await repositories.exercises.insertMany([
    { id: 'ex-1', name: 'Push Up' },
    { id: 'ex-2', name: 'Squat' },
  ]);
  return { service, user };
}

describe('plansService', () => {
  it('getPlanDetail arma el plan con sus días, ejercicios y el detalle del ejercicio del catálogo', async () => {
    const { service, user } = await setup();
    const plan = await service.createPlan(user.id, 'Fuerza');
    const day = await service.addDay(plan.id, 1, 'Empuje');
    await service.addExerciseToDay(day.id, 'ex-1', {
      targetSets: 3,
      targetReps: 10,
      targetWeight: null,
      restSeconds: 30,
      notes: null,
    });

    const detail = await service.getPlanDetail(plan.id);

    expect(detail.plan.name).toBe('Fuerza');
    expect(detail.days).toHaveLength(1);
    expect(detail.days[0]?.day.label).toBe('Empuje');
    expect(detail.days[0]?.exercises[0]?.exercise.name).toBe('Push Up');
  });

  it('duplicateDay copia el día con todos sus ejercicios, sin afectar el original', async () => {
    const { service, user } = await setup();
    const plan = await service.createPlan(user.id, 'Fuerza');
    const day = await service.addDay(plan.id, 1, 'Empuje');
    await service.addExerciseToDay(day.id, 'ex-1', {
      targetSets: 3,
      targetReps: 10,
      targetWeight: null,
      restSeconds: 30,
      notes: null,
    });
    await service.addExerciseToDay(day.id, 'ex-2', {
      targetSets: 4,
      targetReps: 8,
      targetWeight: 60,
      restSeconds: 45,
      notes: 'Cuidado con la técnica',
    });

    const newDay = await service.duplicateDay(day.id);

    const originalDetail = await service.getDayDetail(day.id);
    const newDetail = await service.getDayDetail(newDay.id);
    expect(newDetail.day.id).not.toBe(day.id);
    expect(newDetail.exercises.map(e => e.exercise.id)).toEqual(
      originalDetail.exercises.map(e => e.exercise.id),
    );
    expect(originalDetail.exercises).toHaveLength(2);
  });

  it('duplicatePlan copia el plan completo (días + ejercicios) como un nuevo plan inactivo', async () => {
    const { service, user } = await setup();
    const plan = await service.createPlan(user.id, 'Fuerza');
    await service.setActivePlan(user.id, plan.id);
    const day = await service.addDay(plan.id, 1, 'Empuje');
    await service.addExerciseToDay(day.id, 'ex-1', {
      targetSets: 3,
      targetReps: 10,
      targetWeight: null,
      restSeconds: 30,
      notes: null,
    });

    const copy = await service.duplicatePlan(user.id, plan.id);

    expect(copy.id).not.toBe(plan.id);
    expect(copy.name).toBe('Fuerza (copia)');
    expect(copy.isActive).toBe(false);
    const copyDetail = await service.getPlanDetail(copy.id);
    expect(copyDetail.days).toHaveLength(1);
    expect(copyDetail.days[0]?.exercises).toHaveLength(1);
  });

  it('deletePlan borra el plan y ya no aparece en listPlans', async () => {
    const { service, user } = await setup();
    const plan = await service.createPlan(user.id, 'Fuerza');

    await service.deletePlan(plan.id);

    expect(await service.listPlans(user.id)).toEqual([]);
  });
});
