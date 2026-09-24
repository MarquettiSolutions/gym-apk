import { getLocales } from 'react-native-localize';
import type { Locale } from 'react-native-localize';
import type { Language } from './types';

// Tag de `Intl`/`toLocaleDateString` para cada idioma soportado — español y
// portugués fijos a variantes latinoamericanas neutras (spec issue #30),
// nunca a las de España/Portugal.
export const LOCALE_TAG: Record<Language, string> = {
  en: 'en-US',
  es: 'es-MX',
  pt: 'pt-BR',
};

// Regla de selección de idioma (issue #30): en → inglés, es → español
// LatAm, pt → portugués de Brasil, cualquier otro (o si el SO no reporta
// nada) → inglés por defecto. No se distingue por país dentro de cada
// idioma (es-MX/es-AR/es-ES caen todos en el mismo español LatAm de la
// app, pt-BR/pt-PT caen ambos en portugués de Brasil).
// Recibe `locales` opcionalmente (desde el hook reactivo `useLocalize()` de
// `react-native-localize`, ver `LanguageContext.tsx`) para que el resultado
// se recalcule cuando el idioma del dispositivo cambia en caliente; sin
// argumento cae a la lectura estática `getLocales()`, útil fuera de un
// componente.
export function detectDeviceLanguage(
  locales: readonly Locale[] = getLocales(),
): Language {
  const languageCode = locales[0]?.languageCode;
  if (languageCode === 'es') {
    return 'es';
  }
  if (languageCode === 'pt') {
    return 'pt';
  }
  return 'en';
}

export function resolveLanguage(
  preference: Language | 'system',
  locales?: readonly Locale[],
): Language {
  return preference === 'system' ? detectDeviceLanguage(locales) : preference;
}
