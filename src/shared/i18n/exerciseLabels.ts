import { exerciseInstructionsEs } from './exerciseInstructionsEs';
import { exerciseInstructionsPt } from './exerciseInstructionsPt';
import { exerciseNameTranslations } from './exerciseNames';
import { translations } from './translations';
import type { Language } from './types';

// Subconjunto de `Exercise` que hace falta acá; evita depender de la capa de
// features desde `shared`.
interface LocalizableExercise {
  id?: string;
  name: string;
  isCustom: boolean;
  muscleGroup: string | null;
  equipment: string | null;
  instructions: string | null;
}

// Ediciones locales del usuario: clave `exerciseId|language` -> nombre.
export type ExerciseNameOverrides = ReadonlyMap<string, string>;

export function exerciseNameOverrideKey(
  exerciseId: string,
  language: Language,
): string {
  return `${exerciseId}|${language}`;
}

// Los nombres canónicos del catálogo (free-exercise-db) están en inglés; la
// traducción vive en código, no en la DB, así no hace falta migración y una
// corrección de traducción llega con una actualización de la app. Si no hay
// traducción (o el ejercicio es personalizado, texto libre del usuario) se
// muestra el nombre original — nunca vacío. Prioridad: edición local del
// usuario > traducción del diccionario > nombre en inglés.
export function localizedExerciseName(
  exercise: Pick<LocalizableExercise, 'id' | 'name' | 'isCustom'>,
  language: Language,
  overrides?: ExerciseNameOverrides,
): string {
  if (exercise.isCustom) {
    return exercise.name;
  }
  if (exercise.id && overrides) {
    const override = overrides.get(
      exerciseNameOverrideKey(exercise.id, language),
    );
    if (override) {
      return override;
    }
  }
  if (language === 'en') {
    return exercise.name;
  }
  return exerciseNameTranslations[exercise.name]?.[language] ?? exercise.name;
}

// Las instrucciones del catálogo también vienen en inglés (pasos unidos con
// "\n"). Igual que los nombres, la traducción vive en código, indexada por el
// nombre canónico en inglés; si falta se muestra el texto original — nunca
// vacío. Los ejercicios personalizados (texto del usuario) no se traducen.
export function localizedInstructions(
  exercise: Pick<LocalizableExercise, 'name' | 'isCustom' | 'instructions'>,
  language: Language,
): string | null {
  const { instructions } = exercise;
  if (!instructions || exercise.isCustom || language === 'en') {
    return instructions;
  }
  const dictionary =
    language === 'es' ? exerciseInstructionsEs : exerciseInstructionsPt;
  return dictionary[exercise.name] ?? instructions;
}

// `muscle_group` guarda una lista separada por ", " (músculos primarios +
// secundarios); se traduce cada elemento por separado.
export function localizedMuscleGroup(
  exercise: Pick<LocalizableExercise, 'muscleGroup' | 'isCustom'>,
  language: Language,
): string | null {
  const { muscleGroup } = exercise;
  if (!muscleGroup || exercise.isCustom) {
    return muscleGroup;
  }
  const dictionary: Record<string, string> =
    translations[language].muscleGroups;
  // El catálogo repite el músculo si es primario y secundario a la vez.
  const labels = muscleGroup
    .split(', ')
    .map(muscle => dictionary[muscle.toLowerCase()] ?? muscle);
  return Array.from(new Set(labels)).join(', ');
}

export function localizedEquipment(
  exercise: Pick<LocalizableExercise, 'equipment' | 'isCustom'>,
  language: Language,
): string | null {
  const { equipment } = exercise;
  if (!equipment || exercise.isCustom) {
    return equipment;
  }
  const dictionary: Record<string, string> = translations[language].equipment;
  return dictionary[equipment.toLowerCase()] ?? equipment;
}

// Minúsculas y sin tildes: "sentadilla" y "Sentádilla" encuentran lo mismo.
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Busca sobre el nombre canónico en inglés Y sobre el traducido al idioma
// activo (incluida la edición local del usuario), para que "sentadilla"
// encuentre "Squat" y "squat" también.
export function exerciseMatchesSearch(
  exercise: Pick<LocalizableExercise, 'id' | 'name' | 'isCustom'>,
  language: Language,
  normalizedQuery: string,
  overrides?: ExerciseNameOverrides,
): boolean {
  return (
    normalizeSearchText(exercise.name).includes(normalizedQuery) ||
    normalizeSearchText(
      localizedExerciseName(exercise, language, overrides),
    ).includes(normalizedQuery)
  );
}
