// Importa directo de los módulos hoja (no del barrel `../i18n`), que
// re-exporta `LanguageContext` y por lo tanto arrastra `SettingsContext` →
// el cliente de DB nativo — este util debe quedar sin esa dependencia.
import { getActiveLanguage } from '../i18n/activeLanguage';
import { LOCALE_TAG } from '../i18n/locale';

export function nowIso(): string {
  return new Date().toISOString();
}

// Fecha corta tipo "12 ene"/"Jan 12"/"12 de jan" para ejes de gráfico y
// listas compactas, en el idioma activo (`LanguageProvider` mantiene
// `getActiveLanguage()` sincronizado — ver `shared/i18n/activeLanguage.ts`).
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE_TAG[getActiveLanguage()], {
    day: 'numeric',
    month: 'short',
  });
}

// Fecha + hora tipo "12 ene 2026, 18:30" para filas de historial, en el
// idioma activo.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE_TAG[getActiveLanguage()], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Medianoche local de hoy, en ISO-8601 UTC — se usa para acotar "sesión
// empezada hoy" al resolver el entrenamiento del día (spec 5.3) sin resumir
// por error una sesión sin terminar de una semana anterior.
export function startOfTodayIso(): string {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
}
