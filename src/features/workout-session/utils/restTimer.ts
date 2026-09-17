// Cálculo puro a partir de timestamps reales (no un contador que se
// incrementa con `setInterval`), para que el descanso no se desincronice si
// la app pasa un rato en background (spec 4.1: "temporizador con timestamp
// real, no solo setInterval").
export function remainingSeconds(
  deadline: number,
  now: number = Date.now(),
): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function formatMinutesSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
