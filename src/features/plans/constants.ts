// Mismo criterio que `Date.prototype.getDay()` (spec 4.4: `weekday` 0-6):
// 0 = domingo ... 6 = sábado. Se guarda así para que, en Fase 3, calcular
// "hoy" sea un simple `new Date().getDay()` sin conversiones.
export const WEEKDAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

// Orden de visualización tipo semana laboral (lunes primero) para listas de
// días — el valor guardado en `weekday` no cambia, solo el orden en pantalla.
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const DEFAULT_REST_SECONDS = 30;
