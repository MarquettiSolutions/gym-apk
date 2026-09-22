import { nowIso } from '../shared/utils/dates';
import type { Repositories } from '../db/repositories';
import { EXERCISEDB_RAPIDAPI_KEY } from '../config/apiKeys';
import {
  defaultFetchExerciseDbPage,
  exerciseDbImageUrl,
  fetchExerciseDbCatalog,
  indexExerciseDbCatalogByName,
  normalizeExerciseName,
  type FetchExerciseDbPage,
} from './exerciseDbSource';

const VIDEO_URLS_BACKFILLED_SETTING_KEY = 'video_urls_backfilled_at';
const EXERCISEDB_SOURCE = 'exercisedb';

export interface VideoUrlBackfillDeps {
  apiKey: string;
  fetchPage: FetchExerciseDbPage;
}

const defaultDeps: VideoUrlBackfillDeps = {
  apiKey: EXERCISEDB_RAPIDAPI_KEY,
  fetchPage: defaultFetchExerciseDbPage,
};

// Completa `video_remote_url`/`video_source` de los ejercicios ya importados
// desde free-exercise-db (spec 5.2/5.3, decisión en DOCS/SPEC.md sección 11),
// matcheando por nombre normalizado contra el catálogo de ExerciseDB. Corre
// una sola vez (mismo patrón que `importExerciseCatalogIfNeeded`), llamado
// justo después en `db/client.ts`.
//
// Si no hay API key configurada (`src/config/apiKeys.ts` vacío) o falla la
// consulta a ExerciseDB (sin red, cuota agotada, etc.), no hace nada y NO
// marca el flag de `settings` — así se reintenta solo en el próximo boot, sin
// tirar abajo el arranque de la app por una mejora opcional (mismo espíritu
// que "si falla la descarga de una miniatura, el import continúa" en
// `importCatalog.ts`).
export async function backfillExerciseVideoUrlsIfNeeded(
  repos: Pick<Repositories, 'exercises' | 'settings'>,
  deps: VideoUrlBackfillDeps = defaultDeps,
): Promise<void> {
  if (!deps.apiKey) {
    return;
  }

  const alreadyDone = await repos.settings.get(
    VIDEO_URLS_BACKFILLED_SETTING_KEY,
  );
  if (alreadyDone) {
    return;
  }

  try {
    const catalog = await fetchExerciseDbCatalog(deps.apiKey, deps.fetchPage);
    const index = indexExerciseDbCatalogByName(catalog);

    const localExercises = await repos.exercises.listAll();
    for (const exercise of localExercises) {
      if (exercise.isCustom) {
        continue;
      }
      const match = index.get(normalizeExerciseName(exercise.name));
      if (!match) {
        continue;
      }
      try {
        await repos.exercises.updateVideoRemoteUrl(
          exercise.id,
          exerciseDbImageUrl(match.id),
          EXERCISEDB_SOURCE,
        );
      } catch {
        // no aborta el resto si falla un update puntual.
      }
    }

    await repos.settings.set(VIDEO_URLS_BACKFILLED_SETTING_KEY, nowIso());
  } catch {
    // sin red, cuota agotada, etc. — se reintenta en el próximo boot.
  }
}
