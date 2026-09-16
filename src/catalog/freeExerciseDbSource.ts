import type { exercises } from '../db/schema';

// Fuente del catálogo v1 (ver DOCS/SPEC.md, sección 5.2 y decisión registrada
// en la conversación de implementación): free-exercise-db es dominio público
// (The Unlicense) y no tiene rate limit, a diferencia de ExerciseDB/RapidAPI
// (10 requests/día gratis) o WorkoutX (licencia de imágenes no documentada).
// Contra: solo trae fotos estáticas, no video — video_remote_url queda sin
// completar hasta que se sume un proveedor de video con licencia clara.
export const FREE_EXERCISE_DB_JSON_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const FREE_EXERCISE_DB_IMAGES_BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export interface FreeExerciseDbEntry {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

export type ExerciseCatalogEntry = typeof exercises.$inferInsert;

export function mapToExerciseCatalogEntry(
  entry: FreeExerciseDbEntry,
): ExerciseCatalogEntry {
  const muscles = [...entry.primaryMuscles, ...entry.secondaryMuscles];
  const [firstImage] = entry.images;
  return {
    name: entry.name,
    muscleGroup: muscles.length > 0 ? muscles.join(', ') : null,
    equipment: entry.equipment,
    instructions:
      entry.instructions.length > 0 ? entry.instructions.join('\n') : null,
    thumbnailRemoteUrl: firstImage
      ? `${FREE_EXERCISE_DB_IMAGES_BASE_URL}${firstImage}`
      : null,
    isCustom: false,
  };
}

export async function fetchFreeExerciseDbCatalog(): Promise<
  ExerciseCatalogEntry[]
> {
  const response = await fetch(FREE_EXERCISE_DB_JSON_URL);
  if (!response.ok) {
    throw new Error(
      `No se pudo descargar el catálogo de ejercicios (HTTP ${response.status})`,
    );
  }
  const entries = (await response.json()) as FreeExerciseDbEntry[];
  return entries.map(mapToExerciseCatalogEntry);
}
