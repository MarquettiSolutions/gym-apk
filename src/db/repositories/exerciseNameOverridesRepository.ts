import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { exerciseNameOverrides } from '../schema';
import { nowIso } from '../../shared/utils/dates';

export type ExerciseNameOverride = typeof exerciseNameOverrides.$inferSelect;

export interface ExerciseNameOverridesRepository {
  listAll(): Promise<ExerciseNameOverride[]>;
  upsert(exerciseId: string, language: string, name: string): Promise<void>;
  remove(exerciseId: string, language: string): Promise<void>;
}

export function createExerciseNameOverridesRepository(
  db: AppDatabase,
): ExerciseNameOverridesRepository {
  return {
    async listAll() {
      return db.select().from(exerciseNameOverrides);
    },
    async upsert(exerciseId, language, name) {
      const updatedAt = nowIso();
      await db
        .insert(exerciseNameOverrides)
        .values({ exerciseId, language, name, updatedAt })
        .onConflictDoUpdate({
          target: [
            exerciseNameOverrides.exerciseId,
            exerciseNameOverrides.language,
          ],
          set: { name, updatedAt },
        });
    },
    async remove(exerciseId, language) {
      await db
        .delete(exerciseNameOverrides)
        .where(
          and(
            eq(exerciseNameOverrides.exerciseId, exerciseId),
            eq(exerciseNameOverrides.language, language),
          ),
        );
    },
  };
}
