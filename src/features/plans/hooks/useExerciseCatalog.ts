import { useCallback, useEffect, useState } from 'react';
import { repositories } from '../../../db/client';
import {
  getIsCatalogImporting,
  subscribeCatalogChanged,
} from '../../../catalog/catalogEvents';
import type { Exercise } from '../types';

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCatalogImporting, setIsCatalogImportingState] = useState(
    getIsCatalogImporting,
  );

  const reload = useCallback(async () => {
    setIsLoading(true);
    const list = await repositories.exercises.listAll();
    setExercises(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // El catálogo se importa en segundo plano (issue #54): cuando entran filas
  // nuevas o termina el import, esto refresca la lista sola, sin que el
  // usuario tenga que salir y volver a entrar a la pantalla.
  useEffect(
    () =>
      subscribeCatalogChanged(() => {
        setIsCatalogImportingState(getIsCatalogImporting());
        reload();
      }),
    [reload],
  );

  return { exercises, isLoading, isCatalogImporting, reload };
}
