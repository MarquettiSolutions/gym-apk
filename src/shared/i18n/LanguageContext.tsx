import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useLocalize } from 'react-native-localize';
import { initDatabase, repositories } from '../../db/client';
import { useSettings } from '../../features/settings/context/SettingsContext';
import { setActiveLanguage } from './activeLanguage';
import {
  exerciseMatchesSearch,
  exerciseNameOverrideKey,
  localizedEquipment,
  localizedExerciseName,
  localizedInstructions,
  localizedMuscleGroup,
} from './exerciseLabels';
import type { ExerciseNameOverrides } from './exerciseLabels';
import { resolveLanguage } from './locale';
import { translations } from './translations';
import type { Language, Translations } from './types';

interface LanguageContextValue {
  language: Language;
  t: Translations;
  exerciseName: (
    exercise: Parameters<typeof localizedExerciseName>[0],
  ) => string;
  exerciseMuscleGroup: (
    exercise: Parameters<typeof localizedMuscleGroup>[0],
  ) => string | null;
  exerciseEquipment: (
    exercise: Parameters<typeof localizedEquipment>[0],
  ) => string | null;
  exerciseInstructions: (
    exercise: Parameters<typeof localizedInstructions>[0],
  ) => string | null;
  matchesExerciseSearch: (
    exercise: Parameters<typeof localizedExerciseName>[0],
    normalizedQuery: string,
  ) => boolean;
  // Nombre del diccionario (o inglés) ignorando la edición local; sirve para
  // pre-cargar el formulario de edición y para "Restaurar original".
  exerciseBaseName: (
    exercise: Parameters<typeof localizedExerciseName>[0],
  ) => string;
  hasExerciseNameOverride: (exerciseId: string) => boolean;
  saveExerciseNameOverride: (exerciseId: string, name: string) => Promise<void>;
  restoreExerciseName: (exerciseId: string) => Promise<void>;
  // Relee las ediciones desde SQLite; necesario tras importar un backup, que
  // escribe directo en la tabla.
  reloadExerciseNameOverrides: () => Promise<void>;
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
  const [overrides, setOverrides] = useState<ExerciseNameOverrides>(
    () => new Map(),
  );

  // Este provider se monta por encima del gate `isDbReady` de `App.tsx`,
  // así que espera a que la DB esté lista (memoizado, no repite migraciones).
  const reloadExerciseNameOverrides = useCallback(async () => {
    await initDatabase();
    const rows = await repositories.exerciseNameOverrides.listAll();
    setOverrides(
      new Map(
        rows.map(row => [
          exerciseNameOverrideKey(row.exerciseId, row.language as Language),
          row.name,
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    reloadExerciseNameOverrides();
  }, [reloadExerciseNameOverrides]);

  const saveExerciseNameOverride = useCallback(
    async (exerciseId: string, name: string) => {
      await repositories.exerciseNameOverrides.upsert(
        exerciseId,
        language,
        name,
      );
      await reloadExerciseNameOverrides();
    },
    [language, reloadExerciseNameOverrides],
  );

  const restoreExerciseName = useCallback(
    async (exerciseId: string) => {
      await repositories.exerciseNameOverrides.remove(exerciseId, language);
      await reloadExerciseNameOverrides();
    },
    [language, reloadExerciseNameOverrides],
  );

  // Mantiene el espejo no-React (`activeLanguage.ts`) sincronizado para los
  // servicios de notificaciones, que no pueden usar este contexto.
  useEffect(() => {
    setActiveLanguage(language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: translations[language],
      exerciseName: exercise =>
        localizedExerciseName(exercise, language, overrides),
      exerciseBaseName: exercise => localizedExerciseName(exercise, language),
      hasExerciseNameOverride: exerciseId =>
        overrides.has(exerciseNameOverrideKey(exerciseId, language)),
      saveExerciseNameOverride,
      restoreExerciseName,
      reloadExerciseNameOverrides,
      exerciseMuscleGroup: exercise => localizedMuscleGroup(exercise, language),
      exerciseEquipment: exercise => localizedEquipment(exercise, language),
      exerciseInstructions: exercise =>
        localizedInstructions(exercise, language),
      matchesExerciseSearch: (exercise, normalizedQuery) =>
        exerciseMatchesSearch(exercise, language, normalizedQuery, overrides),
    }),
    [
      language,
      overrides,
      saveExerciseNameOverride,
      restoreExerciseName,
      reloadExerciseNameOverrides,
    ],
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
