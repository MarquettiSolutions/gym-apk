import { DEFAULT_SETTINGS } from '../settings/types';

// Unidad de peso por defecto para series sin peso real (ej. al omitir un
// ejercicio, `weightDone` queda `null` y esta unidad no se llega a mostrar).
// Para registros con peso real, la unidad la define la preferencia global de
// Ajustes (`useSettings().settings.weightUnit`), no esta constante.
export const DEFAULT_WEIGHT_UNIT = DEFAULT_SETTINGS.weightUnit;

// Ajuste manual del temporizador de descanso (spec 5.3: "+15s/-15s").
export const REST_TIMER_STEP_SECONDS = 15;
