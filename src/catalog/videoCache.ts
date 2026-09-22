import type { exercises } from '../db/schema';
import type { ExercisesRepository } from '../db/repositories/exercisesRepository';
import { cacheVideo, type CacheVideoOptions } from './mediaCache';
import { nowIso } from '../shared/utils/dates';
import { EXERCISEDB_API_HOST } from './exerciseDbSource';
import { EXERCISEDB_RAPIDAPI_KEY } from '../config/apiKeys';

export interface VideoCacheDeps {
  downloadVideo: (
    exerciseId: string,
    remoteUrl: string,
    options?: CacheVideoOptions,
  ) => Promise<string>;
}

const defaultDeps: VideoCacheDeps = {
  downloadVideo: cacheVideo,
};

// Arma extensión + headers de auth según el proveedor del video (spec 5.2,
// decisión en DOCS/SPEC.md sección 11). ExerciseDB sirve GIF (no mp4) y exige
// la API key de RapidAPI en cada request de descarga — la URL guardada en
// `video_remote_url` nunca la incluye (ver `exerciseDbSource.ts`). Otros
// casos (`videoSource` null, ej. video propio de un ejercicio personalizado)
// usan el default de `cacheVideo` (mp4, sin headers).
function downloadOptionsFor(
  videoSource: string | null,
): CacheVideoOptions | undefined {
  if (videoSource === 'exercisedb') {
    return {
      extension: 'gif',
      headers: {
        'X-RapidAPI-Key': EXERCISEDB_RAPIDAPI_KEY,
        'X-RapidAPI-Host': EXERCISEDB_API_HOST,
      },
    };
  }
  return undefined;
}

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
  const options = downloadOptionsFor(exercise.videoSource);
  const localPath = options
    ? await deps.downloadVideo(exercise.id, exercise.videoRemoteUrl, options)
    : await deps.downloadVideo(exercise.id, exercise.videoRemoteUrl);
  await repo.updateVideoLocalPath(exercise.id, localPath, nowIso());
  return localPath;
}
