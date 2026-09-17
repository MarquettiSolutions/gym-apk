import { formatMinutesSeconds, remainingSeconds } from '../restTimer';

describe('remainingSeconds', () => {
  it('redondea hacia arriba el tiempo restante hasta el deadline', () => {
    expect(remainingSeconds(10_000, 8_500)).toBe(2);
    expect(remainingSeconds(10_000, 9_000)).toBe(1);
  });

  it('nunca devuelve un valor negativo una vez pasado el deadline', () => {
    expect(remainingSeconds(10_000, 15_000)).toBe(0);
  });
});

describe('formatMinutesSeconds', () => {
  it('formatea segundos como m:ss', () => {
    expect(formatMinutesSeconds(5)).toBe('0:05');
    expect(formatMinutesSeconds(65)).toBe('1:05');
    expect(formatMinutesSeconds(0)).toBe('0:00');
  });
});
