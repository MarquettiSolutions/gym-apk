import type { AppDatabase } from '../types';
import { exercises } from '../schema';

export interface ExercisesRepository {
  listAll(): Promise<Array<typeof exercises.$inferSelect>>;
}

export function createExercisesRepository(
  db: AppDatabase,
): ExercisesRepository {
  return {
    async listAll() {
      return db.select().from(exercises);
    },
  };
}
