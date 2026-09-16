import type { exercises } from '../db/schema';
import type { ExercisesRepository } from '../db/repositories/exercisesRepository';
import { cacheVideo } from './mediaCache';
import { nowIso } from '../shared/utils/dates';

export interface VideoCacheDeps {
  downloadVideo: (exerciseId: string, remoteUrl: string) => Promise<string>;
}

const defaultDeps: VideoCacheDeps = {
  downloadVideo: cacheVideo,
};

// Descarga el video del ejercicio bajo demanda, la primera vez que se abre su
// detalle (spec 5.2) — nunca se precargan los videos de todo el catálogo.
// La fuente v1 (free-exercise-db) no trae video, así que `videoRemoteUrl`
// queda null para todos los ejercicios importados hasta que se sume un
// proveedor de video con licencia clara; en ese caso esta función no hace
// nada y devuelve null, y la UI debe mostrar la miniatura con el aviso de
// "conectate para ver el video la primera vez" en su lugar.
export async function ensureExerciseVideoCached(
  exercise: typeof exercises.$inferSelect,
  repo: ExercisesRepository,
  deps: VideoCacheDeps = defaultDeps,
): Promise<string | null> {
  if (exercise.videoLocalPath) {
    return exercise.videoLocalPath;
  }
  if (!exercise.videoRemoteUrl) {
    return null;
  }
  const localPath = await deps.downloadVideo(
    exercise.id,
    exercise.videoRemoteUrl,
  );
  await repo.updateVideoLocalPath(exercise.id, localPath, nowIso());
  return localPath;
}
