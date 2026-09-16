import {
  mapToExerciseCatalogEntry,
  type FreeExerciseDbEntry,
} from '../freeExerciseDbSource';

function buildEntry(
  overrides: Partial<FreeExerciseDbEntry> = {},
): FreeExerciseDbEntry {
  return {
    id: '3_4_Sit-Up',
    name: '3/4 Sit-Up',
    equipment: 'body only',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    instructions: ['Paso 1.', 'Paso 2.'],
    images: ['3_4_Sit-Up/0.jpg', '3_4_Sit-Up/1.jpg'],
    ...overrides,
  };
}

describe('mapToExerciseCatalogEntry', () => {
  it('mapea nombre, equipo e instrucciones (unidas con salto de línea)', () => {
    const result = mapToExerciseCatalogEntry(buildEntry());

    expect(result.name).toBe('3/4 Sit-Up');
    expect(result.equipment).toBe('body only');
    expect(result.instructions).toBe('Paso 1.\nPaso 2.');
    expect(result.isCustom).toBe(false);
  });

  it('junta músculos primarios y secundarios en muscle_group', () => {
    const result = mapToExerciseCatalogEntry(
      buildEntry({
        primaryMuscles: ['abdominals'],
        secondaryMuscles: ['hip flexors'],
      }),
    );

    expect(result.muscleGroup).toBe('abdominals, hip flexors');
  });

  it('arma thumbnail_remote_url a partir de la primera imagen', () => {
    const result = mapToExerciseCatalogEntry(buildEntry());

    expect(result.thumbnailRemoteUrl).toBe(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/3_4_Sit-Up/0.jpg',
    );
  });

  it('deja los campos en null si el ejercicio no trae esa data', () => {
    const result = mapToExerciseCatalogEntry(
      buildEntry({
        equipment: null,
        primaryMuscles: [],
        secondaryMuscles: [],
        instructions: [],
        images: [],
      }),
    );

    expect(result.equipment).toBeNull();
    expect(result.muscleGroup).toBeNull();
    expect(result.instructions).toBeNull();
    expect(result.thumbnailRemoteUrl).toBeNull();
  });
});
