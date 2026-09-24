import type { Language } from '../../../shared/i18n';

export const MAX_EXERCISE_NAME_LENGTH = 80;

const ISSUES_NEW_URL =
  'https://github.com/MarquettiSolutions/gym-apk/issues/new';
export const TRANSLATION_LABEL = 'traducción';

export type ExerciseNameValidation =
  | { ok: true; name: string }
  | { ok: false; reason: 'empty' | 'tooLong' };

export function validateExerciseName(raw: string): ExerciseNameValidation {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name === '') {
    return { ok: false, reason: 'empty' };
  }
  if (name.length > MAX_EXERCISE_NAME_LENGTH) {
    return { ok: false, reason: 'tooLong' };
  }
  return { ok: true, name };
}

export interface NameSuggestion {
  originalName: string;
  language: Language;
  currentName: string;
  suggestedName: string;
  appVersion: string;
}

// Página de "nueva issue" prellenada: el usuario la revisa y la publica con
// su propia cuenta, así no se embebe ningún token en la app. Sin datos
// personales.
export function buildNameSuggestionUrl(suggestion: NameSuggestion): string {
  const title = `[${suggestion.language}] ${suggestion.originalName} → ${suggestion.suggestedName}`;
  const body = [
    '## Sugerencia de corrección de nombre',
    '',
    `- **Nombre original (inglés, clave del diccionario):** ${suggestion.originalName}`,
    `- **Idioma:** ${suggestion.language}`,
    `- **Nombre actual en la app:** ${suggestion.currentName}`,
    `- **Nombre sugerido:** ${suggestion.suggestedName}`,
    `- **Versión de la app:** ${suggestion.appVersion}`,
  ].join('\n');
  const params: [string, string][] = [
    ['title', title],
    ['body', body],
    ['labels', TRANSLATION_LABEL],
  ];
  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${ISSUES_NEW_URL}?${query}`;
}
