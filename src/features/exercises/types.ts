import type { exercises } from '../../db/schema';

export type Exercise = typeof exercises.$inferSelect;

export interface CreateCustomExerciseInput {
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  thumbnailUri: string | null;
  videoUri: string | null;
}
