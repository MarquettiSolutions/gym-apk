import { importExerciseCatalogIfNeeded } from '../importCatalog';
import { createTestDb } from '../../db/repositories/testDb';
import { createExercisesRepository } from '../../db/repositories/exercisesRepository';
import { createSettingsRepository } from '../../db/repositories/settingsRepository';
import type { ExerciseCatalogEntry } from '../freeExerciseDbSource';

function buildRepos() {
  const db = createTestDb();
  return {
    exercises: createExercisesRepository(db),
    settings: createSettingsRepository(db),
  };
}

const sampleCatalog: ExerciseCatalogEntry[] = [
  {
    name: '3/4 Sit-Up',
    muscleGroup: 'abdominals',
    equipment: 'body only',
    instructions: 'Paso 1.',
    thumbnailRemoteUrl: 'https://example.com/situp.jpg',
    isCustom: false,
  },
  {
    name: 'Air Bike',
    muscleGroup: 'abdominals',
    equipment: null,
    instructions: null,
    thumbnailRemoteUrl: null,
    isCustom: false,
  },
];

describe('importExerciseCatalogIfNeeded', () => {
  it('inserta todos los ejercicios y cachea la miniatura de los que la tienen', async () => {
    const repos = buildRepos();
    const downloadThumbnail = jest.fn(
      async (exerciseId: string) => `/local/${exerciseId}.jpg`,
    );

    await importExerciseCatalogIfNeeded(repos, {
      fetchCatalog: async () => sampleCatalog,
      downloadThumbnail,
    });

    const all = await repos.exercises.listAll();
    expect(all).toHaveLength(2);
    // Solo el que trae thumbnailRemoteUrl dispara la descarga.
    expect(downloadThumbnail).toHaveBeenCalledTimes(1);

    const situp = all.find(e => e.name === '3/4 Sit-Up');
    expect(situp?.thumbnailLocalPath).toBe(`/local/${situp?.id}.jpg`);

    const airBike = all.find(e => e.name === 'Air Bike');
    expect(airBike?.thumbnailLocalPath).toBeNull();
  });

  it('marca el catálogo como importado en settings', async () => {
    const repos = buildRepos();

    await importExerciseCatalogIfNeeded(repos, {
      fetchCatalog: async () => sampleCatalog,
      downloadThumbnail: async id => `/local/${id}.jpg`,
    });

    expect(await repos.settings.get('catalog_imported_at')).toBeTruthy();
  });

  it('es idempotente: no vuelve a importar si ya está marcado', async () => {
    const repos = buildRepos();
    const fetchCatalog = jest.fn(async () => sampleCatalog);

    await importExerciseCatalogIfNeeded(repos, {
      fetchCatalog,
      downloadThumbnail: async id => `/local/${id}.jpg`,
    });
    await importExerciseCatalogIfNeeded(repos, {
      fetchCatalog,
      downloadThumbnail: async id => `/local/${id}.jpg`,
    });

    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    expect(await repos.exercises.listAll()).toHaveLength(2);
  });

  it('si falla la descarga de una miniatura, el resto del import continúa', async () => {
    const repos = buildRepos();

    await importExerciseCatalogIfNeeded(repos, {
      fetchCatalog: async () => sampleCatalog,
      downloadThumbnail: async () => {
        throw new Error('network error');
      },
    });

    const all = await repos.exercises.listAll();
    expect(all).toHaveLength(2);
    expect(await repos.settings.get('catalog_imported_at')).toBeTruthy();
  });
});
