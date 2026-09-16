// Corre `fn` sobre `items` con como máximo `limit` promesas en vuelo a la vez.
// Se usa para descargas masivas (ej. miniaturas del catálogo) donde lanzar
// todo en paralelo saturaría la red/el dispositivo, y hacerlo secuencial
// sería demasiado lento (800+ ejercicios).
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await fn(items[currentIndex]!, currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
