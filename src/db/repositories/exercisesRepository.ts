import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { exercises } from '../schema';
import { assertDefined } from '../../shared/utils/assert';

export interface ExercisesRepository {
  listAll(): Promise<Array<typeof exercises.$inferSelect>>;
  getById(id: string): Promise<typeof exercises.$inferSelect | undefined>;
  insertMany(values: Array<typeof exercises.$inferInsert>): Promise<void>;
  insertOne(
    values: typeof exercises.$inferInsert,
  ): Promise<typeof exercises.$inferSelect>;
  updateThumbnailLocalPath(id: string, path: string): Promise<void>;
  updateVideoLocalPath(
    id: string,
    path: string,
    cachedAt: string,
  ): Promise<void>;
  updateVideoRemoteUrl(id: string, url: string, source: string): Promise<void>;
}

export function createExercisesRepository(
  db: AppDatabase,
): ExercisesRepository {
  return {
    async listAll() {
      return db.select().from(exercises);
    },
    async getById(id) {
      const [row] = await db
        .select()
        .from(exercises)
        .where(eq(exercises.id, id));
      return row;
    },
    async insertMany(values) {
      if (values.length === 0) {
        return;
      }
      await db.insert(exercises).values(values);
    },
    async insertOne(values) {
      const [created] = await db.insert(exercises).values(values).returning();
      return assertDefined(created, 'No se pudo crear el ejercicio');
    },
    async updateThumbnailLocalPath(id, path) {
      await db
        .update(exercises)
        .set({ thumbnailLocalPath: path })
        .where(eq(exercises.id, id));
    },
    async updateVideoLocalPath(id, path, cachedAt) {
      await db
        .update(exercises)
        .set({ videoLocalPath: path, videoCachedAt: cachedAt })
        .where(eq(exercises.id, id));
    },
    async updateVideoRemoteUrl(id, url, source) {
      await db
        .update(exercises)
        .set({ videoRemoteUrl: url, videoSource: source })
        .where(eq(exercises.id, id));
    },
  };
}
