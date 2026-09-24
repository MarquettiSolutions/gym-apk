import { en } from './en';
import { es } from './es';
import { pt } from './pt';
import type { Language, Translations } from './types';

export const translations: Record<Language, Translations> = { en, es, pt };
