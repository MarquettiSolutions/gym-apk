import type { Language } from '../../shared/i18n/types';

export type ThemePreference = 'light' | 'dark' | 'system';
export type WeightUnit = 'kg' | 'lb';
// Idioma preferido por el usuario, o `'system'` para seguir la detección
// automática del idioma del dispositivo (spec issue #30).
export type LanguagePreference = Language | 'system';

export interface AppSettings {
  defaultRestSeconds: number;
  weightUnit: WeightUnit;
  theme: ThemePreference;
  language: LanguagePreference;
  timerSoundEnabled: boolean;
  timerVibrationEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 30,
  weightUnit: 'kg',
  theme: 'system',
  language: 'system',
  timerSoundEnabled: true,
  timerVibrationEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderHour: 8,
  dailyReminderMinute: 0,
};
