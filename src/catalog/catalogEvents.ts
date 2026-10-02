// Notifica a los hooks de UI (ver `useExerciseCatalog`) que el catálogo
// cambió, sin acoplar `importCatalog.ts` a React. El import corre en segundo
// plano (issue #54) y esto es lo que permite que la lista de ejercicios se
// actualice sola, sin que el usuario tenga que salir y volver a entrar a la
// pantalla.
type Listener = () => void;

const listeners = new Set<Listener>();
let isImporting = false;

export function getIsCatalogImporting(): boolean {
  return isImporting;
}

export function setIsCatalogImporting(value: boolean): void {
  isImporting = value;
  notifyCatalogChanged();
}

export function notifyCatalogChanged(): void {
  listeners.forEach(listener => listener());
}

export function subscribeCatalogChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
