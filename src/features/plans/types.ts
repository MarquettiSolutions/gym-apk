import type {
  exercises,
  planDayExercises,
  planDays,
  plans,
} from '../../db/schema';

export type Plan = typeof plans.$inferSelect;
export type PlanDay = typeof planDays.$inferSelect;
export type PlanDayExercise = typeof planDayExercises.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;

export interface PlanDayExerciseDetail {
  planDayExercise: PlanDayExercise;
  exercise: Exercise;
}

export interface PlanDayDetail {
  day: PlanDay;
  exercises: PlanDayExerciseDetail[];
}

export interface PlanDetail {
  plan: Plan;
  days: PlanDayDetail[];
}

export interface DayExerciseFormValues {
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  restSeconds: number;
  notes: string | null;
}
