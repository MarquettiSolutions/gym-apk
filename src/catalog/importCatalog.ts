import { uuid } from '../shared/utils/id';
import { nowIso } from '../shared/utils/dates';
import type { Repositories } from '../db/repositories';
import { cacheThumbnail } from './mediaCache';
import {
  fetchFreeExerciseDbCatalog,
  type ExerciseCatalogEntry,
} from './freeExerciseDbSource';
import { mapWithConcurrency } from '../shared/utils/concurrency';

const CATALOG_IMPORTED_SETTING_KEY = 'catalog_imported_at';
const THUMBNAIL_DOWNLOAD_CONCURRENCY = 8;

export interface ImportCatalogDeps {
  fetchCatalog: () => Promise<ExerciseCatalogEntry[]>;
  downloadThumbnail: (exerciseId: string, remoteUrl: string) => Promise<string>;
}

const defaultDeps: ImportCatalogDeps = {
  fetchCatalog: fetchFreeExerciseDbCatalog,
  downloadThumbnail: cacheThumbnail,
};

// Importa el catálogo de ejercicios una única vez (ver spec 5.2): en llamadas
// siguientes es un no-op porque ya quedó marcado en `settings`. Si falla la
// descarga de una miniatura puntual no aborta el import completo — el
// ejercicio queda igual usable (sin esa miniatura local todavía).
export async function importExerciseCatalogIfNeeded(
  repos: Pick<Repositories, 'exercises' | 'settings'>,
  deps: ImportCatalogDeps = defaultDeps,
): Promise<void> {
  const alreadyImported = await repos.settings.get(
    CATALOG_IMPORTED_SETTING_KEY,
  );
  if (alreadyImported) {
    return;
  }

  const entries = await deps.fetchCatalog();
  const entriesWithId = entries.map(entry => ({ ...entry, id: uuid() }));

  await repos.exercises.insertMany(entriesWithId);

  const entriesWithThumbnail = entriesWithId.filter(
    (entry): entry is typeof entry & { thumbnailRemoteUrl: string } =>
      typeof entry.thumbnailRemoteUrl === 'string',
  );

  await mapWithConcurrency(
    entriesWithThumbnail,
    THUMBNAIL_DOWNLOAD_CONCURRENCY,
    async entry => {
      try {
        const localPath = await deps.downloadThumbnail(
          entry.id,
          entry.thumbnailRemoteUrl,
        );
        await repos.exercises.updateThumbnailLocalPath(entry.id, localPath);
      } catch {
        // ver comentario de la función: se ignora, no aborta el import.
      }
    },
  );

  await repos.settings.set(CATALOG_IMPORTED_SETTING_KEY, nowIso());
}
