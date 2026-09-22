// Proveedor de video/GIF para el detalle de ejercicio (spec 5.2/5.3, decisión
// registrada en DOCS/SPEC.md sección 11): ExerciseDB vía RapidAPI, plan Basic
// gratuito (690 req/mes, GIF fijo en 180px). Se usa SOLO para completar
// `video_remote_url`/`video_source` de los ejercicios ya importados desde
// free-exercise-db (ver `videoUrlBackfill.ts`) — no reemplaza al catálogo base.
//
// No se usa `searchExercisesByName` (1 request por ejercicio local, >800
// requests, superaría la cuota mensual). En cambio se pagina `listExercises`
// una sola vez (10 resultados por request en el plan free, ~130 requests para
// ~1300 ejercicios) y el matching contra el catálogo local se hace en memoria
// por nombre normalizado.

export const EXERCISEDB_API_HOST = 'exercisedb.p.rapidapi.com';
export const EXERCISEDB_BASE_URL = `https://${EXERCISEDB_API_HOST}`;
const PAGE_SIZE = 10; // tope real del plan Basic, pedir más no trae más.

export interface ExerciseDbEntry {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
}

export interface FetchExerciseDbPageParams {
  apiKey: string;
  offset: number;
  limit: number;
}

export type FetchExerciseDbPage = (
  params: FetchExerciseDbPageParams,
) => Promise<ExerciseDbEntry[]>;

export const defaultFetchExerciseDbPage: FetchExerciseDbPage = async ({
  apiKey,
  offset,
  limit,
}) => {
  const url = `${EXERCISEDB_BASE_URL}/exercises?offset=${offset}&limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': EXERCISEDB_API_HOST,
    },
  });
  if (!response.ok) {
    throw new Error(
      `No se pudo consultar el catálogo de ExerciseDB (HTTP ${response.status})`,
    );
  }
  return (await response.json()) as ExerciseDbEntry[];
};

// Nombre normalizado para matchear contra el catálogo local (mismo linaje de
// datos que free-exercise-db, los nombres suelen coincidir case-insensitive).
export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase();
}

// Trae el catálogo completo de ExerciseDB paginando `listExercises` hasta que
// una página vuelve con menos de PAGE_SIZE ítems (fin del dataset).
export async function fetchExerciseDbCatalog(
  apiKey: string,
  fetchPage: FetchExerciseDbPage = defaultFetchExerciseDbPage,
): Promise<ExerciseDbEntry[]> {
  const all: ExerciseDbEntry[] = [];
  let offset = 0;
  let lastPageSize = PAGE_SIZE;
  while (lastPageSize === PAGE_SIZE) {
    const page = await fetchPage({ apiKey, offset, limit: PAGE_SIZE });
    all.push(...page);
    lastPageSize = page.length;
    offset += PAGE_SIZE;
  }
  return all;
}

// Índice por nombre normalizado para matching O(1) contra el catálogo local.
export function indexExerciseDbCatalogByName(
  entries: ExerciseDbEntry[],
): Map<string, ExerciseDbEntry> {
  const index = new Map<string, ExerciseDbEntry>();
  for (const entry of entries) {
    index.set(normalizeExerciseName(entry.name), entry);
  }
  return index;
}

// URL que se guarda en `exercises.video_remote_url`: SIN la API key embebida
// (esta fila se exporta en el backup de datos, spec 5.6 — no hay que filtrar
// la key ahí). La key se agrega como header recién al descargar (videoCache.ts).
export function exerciseDbImageUrl(entryId: string): string {
  return `${EXERCISEDB_BASE_URL}/image?exerciseId=${entryId}&resolution=180`;
}
