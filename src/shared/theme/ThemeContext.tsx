import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '../../features/settings/context/SettingsContext';
import { palette } from './colors';
import type { ThemeColors } from './colors';
import { spacing } from './spacing';

interface ThemeContextValue {
  colors: ThemeColors;
  spacing: typeof spacing;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

// Resuelve el tema activo combinando la preferencia guardada en Ajustes
// (claro/oscuro/sistema) con el esquema de color actual del sistema
// operativo (spec 5.6: "Tema claro/oscuro (o seguir el sistema)").
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? palette.dark : palette.light,
      spacing,
      isDark,
    }),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return context;
}
