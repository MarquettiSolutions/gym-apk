import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { palette } from './colors';

// Header y tab bar de React Navigation se pintan solos a partir de esto —
// no hace falta tocar cada stack navigator para que respeten el tema.
function buildNavigationTheme(
  base: Theme,
  colors: typeof palette.light,
): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}

export const lightNavigationTheme = buildNavigationTheme(
  DefaultTheme,
  palette.light,
);
export const darkNavigationTheme = buildNavigationTheme(
  DarkTheme,
  palette.dark,
);
