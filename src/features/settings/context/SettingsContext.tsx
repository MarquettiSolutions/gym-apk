import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { initDatabase } from '../../../db/client';
import { settingsService } from '../services';
import { ensureDailyReminderScheduled } from '../../notifications/services/dailyReminderService';
import { DEFAULT_SETTINGS } from '../types';
import type { AppSettings } from '../types';

interface SettingsContextValue {
  settings: AppSettings;
  isLoaded: boolean;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => Promise<void>;
  // Vuelve a leer todas las preferencias desde SQLite. Necesario después de
  // importar un backup (`backupService.importBackup` escribe directo en la
  // tabla `settings`, sin pasar por `updateSetting`, así que el estado de
  // este contexto queda desactualizado hasta que se llama a esto).
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

// Carga las preferencias guardadas en SQLite una vez que la DB está lista
// (ver `initDatabase` en `App.tsx`) y las expone reactivamente a toda la
// app. Hasta que termine de cargar, se usan los defaults — así el resto de
// la UI (tema incluido) puede montarse sin esperar a este provider.
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(async () => {
    // `initDatabase` está memoizada (ver `db/client.ts`): esto solo espera a
    // que terminen las migraciones si todavía no corrieron, nunca las repite.
    // Necesario porque este provider se monta por encima del gate
    // `isDbReady` de `App.tsx` (el tema depende de la preferencia guardada
    // desde el arranque), así que no puede asumir que la DB ya está lista.
    await initDatabase();
    const loaded = await settingsService.loadSettings();
    setSettings(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-arma el recordatorio diario cada vez que cambia la preferencia (o al
  // abrir la app) — cubre el caso de OEMs agresivos que puedan haber matado
  // el WorkManager en background, además de la reprogramación reactiva al
  // tocar el switch/hora en Ajustes o tras importar un backup.
  const { dailyReminderEnabled, dailyReminderHour, dailyReminderMinute } =
    settings;
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    ensureDailyReminderScheduled({
      dailyReminderEnabled,
      dailyReminderHour,
      dailyReminderMinute,
    }).catch(() => undefined);
  }, [isLoaded, dailyReminderEnabled, dailyReminderHour, dailyReminderMinute]);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      await settingsService.saveSetting(key, value);
    },
    [],
  );

  const value = useMemo(
    () => ({ settings, isLoaded, updateSetting, reload }),
    [settings, isLoaded, updateSetting, reload],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings debe usarse dentro de <SettingsProvider>');
  }
  return context;
}
