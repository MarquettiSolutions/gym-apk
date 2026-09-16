import { mapWithConcurrency } from '../concurrency';

describe('mapWithConcurrency', () => {
  it('devuelve los resultados en el mismo orden que los items de entrada', async () => {
    const items = [5, 1, 4, 2, 3];

    const results = await mapWithConcurrency(items, 2, async n => {
      await new Promise(resolve => setTimeout(resolve, n));
      return n * 10;
    });

    expect(results).toEqual([50, 10, 40, 20, 30]);
  });

  it('nunca corre más de `limit` promesas en simultáneo', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const items = Array.from({ length: 10 }, (_, i) => i);

    await mapWithConcurrency(items, 3, async n => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise(resolve => setTimeout(resolve, 5));
      inFlight -= 1;
      return n;
    });

    expect(maxInFlight).toBeLessThanOrEqual(3);
  });

  it('funciona con una lista vacía', async () => {
    const results = await mapWithConcurrency([], 4, async (n: number) => n);
    expect(results).toEqual([]);
  });
});
