import type { Repositories } from '../../../db/repositories';
import { DEFAULT_SETTINGS } from '../types';
import type { AppSettings, ThemePreference, WeightUnit } from '../types';

// Cada campo de `AppSettings` vive como una fila `key`/`value` (texto) en la
// única tabla mutable in-place (ver spec 4.4) — el resto de las tablas son
// append-only.
const SETTINGS_KEYS: Record<keyof AppSettings, string> = {
  defaultRestSeconds: 'default_rest_seconds',
  weightUnit: 'weight_unit',
  theme: 'theme',
  timerSoundEnabled: 'timer_sound_enabled',
  timerVibrationEnabled: 'timer_vibration_enabled',
  dailyReminderEnabled: 'daily_reminder_enabled',
  dailyReminderHour: 'daily_reminder_hour',
  dailyReminderMinute: 'daily_reminder_minute',
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  return value === undefined ? fallback : value === 'true';
}

function parseWeightUnit(value: string | undefined): WeightUnit {
  return value === 'lb' ? 'lb' : DEFAULT_SETTINGS.weightUnit;
}

function parseTheme(value: string | undefined): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : DEFAULT_SETTINGS.theme;
}

export function createSettingsService(repositories: Repositories) {
  async function loadSettings(): Promise<AppSettings> {
    const [
      defaultRestSecondsRaw,
      weightUnitRaw,
      themeRaw,
      timerSoundEnabledRaw,
      timerVibrationEnabledRaw,
      dailyReminderEnabledRaw,
      dailyReminderHourRaw,
      dailyReminderMinuteRaw,
    ] = await Promise.all([
      repositories.settings.get(SETTINGS_KEYS.defaultRestSeconds),
      repositories.settings.get(SETTINGS_KEYS.weightUnit),
      repositories.settings.get(SETTINGS_KEYS.theme),
      repositories.settings.get(SETTINGS_KEYS.timerSoundEnabled),
      repositories.settings.get(SETTINGS_KEYS.timerVibrationEnabled),
      repositories.settings.get(SETTINGS_KEYS.dailyReminderEnabled),
      repositories.settings.get(SETTINGS_KEYS.dailyReminderHour),
      repositories.settings.get(SETTINGS_KEYS.dailyReminderMinute),
    ]);

    return {
      defaultRestSeconds: parseNumber(
        defaultRestSecondsRaw,
        DEFAULT_SETTINGS.defaultRestSeconds,
      ),
      weightUnit: parseWeightUnit(weightUnitRaw),
      theme: parseTheme(themeRaw),
      timerSoundEnabled: parseBoolean(
        timerSoundEnabledRaw,
        DEFAULT_SETTINGS.timerSoundEnabled,
      ),
      timerVibrationEnabled: parseBoolean(
        timerVibrationEnabledRaw,
        DEFAULT_SETTINGS.timerVibrationEnabled,
      ),
      dailyReminderEnabled: parseBoolean(
        dailyReminderEnabledRaw,
        DEFAULT_SETTINGS.dailyReminderEnabled,
      ),
      dailyReminderHour: parseNumber(
        dailyReminderHourRaw,
        DEFAULT_SETTINGS.dailyReminderHour,
      ),
      dailyReminderMinute: parseNumber(
        dailyReminderMinuteRaw,
        DEFAULT_SETTINGS.dailyReminderMinute,
      ),
    };
  }

  async function saveSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    await repositories.settings.set(SETTINGS_KEYS[key], String(value));
  }

  return { loadSettings, saveSetting };
}

export type SettingsService = ReturnType<typeof createSettingsService>;
