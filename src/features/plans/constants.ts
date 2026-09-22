// Los nombres de los días viven en `shared/i18n` (`Translations['weekdays']`,
// mismo índice 0=domingo...6=sábado) — ver `WeekdayPicker.tsx`,
// `PlanEditorScreen.tsx`, `DayEditorScreen.tsx` y `historyService.ts`.

// Orden de visualización tipo semana laboral (lunes primero) para listas de
// días — el valor guardado en `weekday` no cambia, solo el orden en pantalla.
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
