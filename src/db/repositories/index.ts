import type { AppDatabase } from '../types';
import { createUsersRepository } from './usersRepository';
import { createExercisesRepository } from './exercisesRepository';
import { createPlansRepository } from './plansRepository';
import { createPlanDaysRepository } from './planDaysRepository';
import { createPlanDayExercisesRepository } from './planDayExercisesRepository';
import { createWorkoutSessionsRepository } from './workoutSessionsRepository';
import { createBodyWeightLogsRepository } from './bodyWeightLogsRepository';
import { createSettingsRepository } from './settingsRepository';

export * from './usersRepository';
export * from './exercisesRepository';
export * from './plansRepository';
export * from './planDaysRepository';
export * from './planDayExercisesRepository';
export * from './workoutSessionsRepository';
export * from './bodyWeightLogsRepository';
export * from './settingsRepository';

export function createRepositories(db: AppDatabase) {
  return {
    users: createUsersRepository(db),
    exercises: createExercisesRepository(db),
    plans: createPlansRepository(db),
    planDays: createPlanDaysRepository(db),
    planDayExercises: createPlanDayExercisesRepository(db),
    workoutSessions: createWorkoutSessionsRepository(db),
    bodyWeightLogs: createBodyWeightLogsRepository(db),
    settings: createSettingsRepository(db),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
