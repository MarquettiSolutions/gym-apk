import type { Repositories } from '../../../db/repositories';
import { assertDefined } from '../../../shared/utils/assert';
import { uuid } from '../../../shared/utils/id';
import type {
  DayExerciseFormValues,
  PlanDayDetail,
  PlanDetail,
} from '../types';

export function createPlansService(repositories: Repositories) {
  async function getDayDetail(dayId: string): Promise<PlanDayDetail> {
    const day = assertDefined(
      await repositories.planDays.getById(dayId),
      'Día no encontrado',
    );
    const dayExercises = await repositories.planDayExercises.listByDay(dayId);
    const exercisesDetail = await Promise.all(
      dayExercises.map(async planDayExercise => {
        const exercise = assertDefined(
          await repositories.exercises.getById(planDayExercise.exerciseId),
          'Ejercicio no encontrado',
        );
        return { planDayExercise, exercise };
      }),
    );
    return { day, exercises: exercisesDetail };
  }

  async function getPlanDetail(planId: string): Promise<PlanDetail> {
    const plan = assertDefined(
      await repositories.plans.getById(planId),
      'Plan no encontrado',
    );
    const days = await repositories.planDays.listByPlan(planId);
    const dayDetails = await Promise.all(days.map(day => getDayDetail(day.id)));
    return { plan, days: dayDetails };
  }

  async function duplicateDay(dayId: string) {
    const detail = await getDayDetail(dayId);
    const newDay = await repositories.planDays.create({
      planId: detail.day.planId,
      weekday: detail.day.weekday,
      label: detail.day.label,
    });
    const groupIdMap = new Map<string, string>();
    for (const { planDayExercise } of detail.exercises) {
      const supersetGroupId = planDayExercise.supersetGroupId
        ? getOrCreateGroupId(groupIdMap, planDayExercise.supersetGroupId)
        : null;
      await repositories.planDayExercises.create({
        planDayId: newDay.id,
        exerciseId: planDayExercise.exerciseId,
        orderIndex: planDayExercise.orderIndex,
        targetSets: planDayExercise.targetSets,
        targetReps: planDayExercise.targetReps,
        targetWeight: planDayExercise.targetWeight,
        restSeconds: planDayExercise.restSeconds,
        notes: planDayExercise.notes,
        supersetGroupId,
      });
    }
    return newDay;
  }

  async function duplicatePlan(userId: string, planId: string) {
    const detail = await getPlanDetail(planId);
    const newPlan = await repositories.plans.create({
      userId,
      name: `${detail.plan.name} (copia)`,
    });
    for (const dayDetail of detail.days) {
      const newDay = await repositories.planDays.create({
        planId: newPlan.id,
        weekday: dayDetail.day.weekday,
        label: dayDetail.day.label,
      });
      const groupIdMap = new Map<string, string>();
      for (const { planDayExercise } of dayDetail.exercises) {
        const supersetGroupId = planDayExercise.supersetGroupId
          ? getOrCreateGroupId(groupIdMap, planDayExercise.supersetGroupId)
          : null;
        await repositories.planDayExercises.create({
          planDayId: newDay.id,
          exerciseId: planDayExercise.exerciseId,
          orderIndex: planDayExercise.orderIndex,
          targetSets: planDayExercise.targetSets,
          targetReps: planDayExercise.targetReps,
          targetWeight: planDayExercise.targetWeight,
          restSeconds: planDayExercise.restSeconds,
          notes: planDayExercise.notes,
          supersetGroupId,
        });
      }
    }
    return newPlan;
  }

  function getOrCreateGroupId(
    map: Map<string, string>,
    oldGroupId: string,
  ): string {
    const existing = map.get(oldGroupId);
    if (existing) {
      return existing;
    }
    const newGroupId = uuid();
    map.set(oldGroupId, newGroupId);
    return newGroupId;
  }

  async function createSupersetGroup(
    dayId: string,
    planDayExerciseIds: string[],
  ) {
    if (planDayExerciseIds.length < 2) {
      throw new Error('Una superserie necesita al menos 2 ejercicios');
    }
    const detail = await getDayDetail(dayId);
    const selectedIds = new Set(planDayExerciseIds);
    const currentIds = detail.exercises.map(e => e.planDayExercise.id);
    for (const { planDayExercise } of detail.exercises) {
      if (
        selectedIds.has(planDayExercise.id) &&
        planDayExercise.supersetGroupId
      ) {
        throw new Error('Uno de los ejercicios ya pertenece a una superserie');
      }
    }
    if (!planDayExerciseIds.every(id => currentIds.includes(id))) {
      throw new Error('Uno de los ejercicios no pertenece a este día');
    }

    const selectedInOrder = currentIds.filter(id => selectedIds.has(id));
    const newOrderedIds: string[] = [];
    let insertedGroup = false;
    for (const id of currentIds) {
      if (selectedIds.has(id)) {
        if (!insertedGroup) {
          newOrderedIds.push(...selectedInOrder);
          insertedGroup = true;
        }
      } else {
        newOrderedIds.push(id);
      }
    }

    await repositories.planDayExercises.reorder(dayId, newOrderedIds);
    await repositories.planDayExercises.setSupersetGroup(
      selectedInOrder,
      uuid(),
    );
  }

  async function dissolveSupersetGroup(dayId: string, groupId: string) {
    const detail = await getDayDetail(dayId);
    const memberIds = detail.exercises
      .filter(e => e.planDayExercise.supersetGroupId === groupId)
      .map(e => e.planDayExercise.id);
    await repositories.planDayExercises.setSupersetGroup(memberIds, null);
  }

  return {
    listPlans: (userId: string) => repositories.plans.listByUser(userId),
    getPlanDetail,
    getDayDetail,
    createPlan: (userId: string, name: string) =>
      repositories.plans.create({ userId, name }),
    renamePlan: (id: string, name: string) =>
      repositories.plans.rename(id, name),
    setActivePlan: (userId: string, id: string) =>
      repositories.plans.setActive(userId, id),
    deletePlan: (id: string) => repositories.plans.remove(id),
    duplicatePlan,
    addDay: (planId: string, weekday: number, label: string | null) =>
      repositories.planDays.create({ planId, weekday, label }),
    updateDay: (
      dayId: string,
      values: { weekday?: number; label?: string | null },
    ) => repositories.planDays.update(dayId, values),
    deleteDay: (dayId: string) => repositories.planDays.remove(dayId),
    duplicateDay,
    addExerciseToDay: (
      dayId: string,
      exerciseId: string,
      values: DayExerciseFormValues,
    ) =>
      repositories.planDayExercises.create({
        planDayId: dayId,
        exerciseId,
        ...values,
      }),
    updateDayExercise: (id: string, values: DayExerciseFormValues) =>
      repositories.planDayExercises.update(id, values),
    removeDayExercise: (id: string) => repositories.planDayExercises.remove(id),
    reorderDayExercises: (dayId: string, orderedIds: string[]) =>
      repositories.planDayExercises.reorder(dayId, orderedIds),
    createSupersetGroup,
    dissolveSupersetGroup,
  };
}

export type PlansService = ReturnType<typeof createPlansService>;
