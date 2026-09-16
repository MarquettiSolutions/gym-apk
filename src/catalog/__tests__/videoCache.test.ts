import { ensureExerciseVideoCached } from '../videoCache';
import { createTestDb } from '../../db/repositories/testDb';
import { createExercisesRepository } from '../../db/repositories/exercisesRepository';
import type { exercises } from '../../db/schema';

function buildExercise(
  overrides: Partial<typeof exercises.$inferSelect> = {},
): typeof exercises.$inferSelect {
  return {
    id: 'a',
    name: 'Push Up',
    muscleGroup: null,
    equipment: null,
    instructions: null,
    thumbnailRemoteUrl: null,
    thumbnailLocalPath: null,
    videoSource: null,
    videoRemoteUrl: null,
    videoLocalPath: null,
    videoCachedAt: null,
    isCustom: false,
    createdByUserId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ensureExerciseVideoCached', () => {
  it('no hace nada si el ejercicio no tiene video_remote_url (fuente v1 sin video)', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    const downloadVideo = jest.fn();

    const result = await ensureExerciseVideoCached(buildExercise(), repo, {
      downloadVideo,
    });

    expect(result).toBeNull();
    expect(downloadVideo).not.toHaveBeenCalled();
  });

  it('devuelve el path local existente sin volver a descargar', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    const downloadVideo = jest.fn();

    const result = await ensureExerciseVideoCached(
      buildExercise({
        videoRemoteUrl: 'https://example.com/pushup.mp4',
        videoLocalPath: '/local/a.mp4',
      }),
      repo,
      { downloadVideo },
    );

    expect(result).toBe('/local/a.mp4');
    expect(downloadVideo).not.toHaveBeenCalled();
  });

  it('descarga el video y actualiza el repositorio cuando hay video_remote_url y no está cacheado', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    await repo.insertMany([
      {
        id: 'a',
        name: 'Push Up',
        videoRemoteUrl: 'https://example.com/pushup.mp4',
      },
    ]);
    const downloadVideo = jest.fn(async () => '/local/a.mp4');

    const exercise = await repo.getById('a');
    const result = await ensureExerciseVideoCached(exercise!, repo, {
      downloadVideo,
    });

    expect(result).toBe('/local/a.mp4');
    expect(downloadVideo).toHaveBeenCalledWith(
      'a',
      'https://example.com/pushup.mp4',
    );
    const updated = await repo.getById('a');
    expect(updated?.videoLocalPath).toBe('/local/a.mp4');
    expect(updated?.videoCachedAt).toBeTruthy();
  });
});
