import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalize } from 'react-native-localize';
import { useSettings } from '../../features/settings/context/SettingsContext';
import { setActiveLanguage } from './activeLanguage';
import { resolveLanguage } from './locale';
import { translations } from './translations';
import type { Language, Translations } from './types';

interface LanguageContextValue {
  language: Language;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

// Resuelve el idioma activo combinando la preferencia guardada en Ajustes
// (inglés/español/portugués/sistema) con el idioma del dispositivo (spec
// issue #30), igual que `ThemeProvider` hace con claro/oscuro/sistema.
// `useLocalize()` es reactivo: si el idioma del sistema cambia con la app
// abierta (Ajustes del teléfono, sin reiniciar), este componente se vuelve a
// renderizar solo.
export function LanguageProvider({ children }: LanguageProviderProps) {
  const { settings } = useSettings();
  const { getLocales } = useLocalize();
  const language = resolveLanguage(settings.language, getLocales());

  // Mantiene el espejo no-React (`activeLanguage.ts`) sincronizado para los
  // servicios de notificaciones, que no pueden usar este contexto.
  useEffect(() => {
    setActiveLanguage(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, t: translations[language] }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation debe usarse dentro de <LanguageProvider>');
  }
  return context;
}
