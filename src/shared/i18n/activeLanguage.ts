import { translations } from './translations';
import type { Language, Translations } from './types';

// Espejo del idioma activo para código fuera del árbol de React (servicios
// de notificaciones: `dailyReminderService.ts`, `restNotifications.ts`), que
// no pueden usar `useTranslation()`. `LanguageProvider` mantiene esto
// sincronizado en un efecto cada vez que el idioma resuelto cambia.
let activeLanguage: Language = 'en';

export function setActiveLanguage(language: Language): void {
  activeLanguage = language;
}

export function getActiveLanguage(): Language {
  return activeLanguage;
}

export function getActiveTranslations(): Translations {
  return translations[activeLanguage];
}
