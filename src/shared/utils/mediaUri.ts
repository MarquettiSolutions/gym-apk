// Convierte un path local de archivo (ej. el que devuelve `mediaCache.ts`) en
// una URI que `<Image>`/`<Video>` de RN pueda cargar. Extraído de
// `ExerciseThumbnail.tsx` para reusarlo también en la imagen/GIF hero del
// detalle de ejercicio.
export function toImageUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('http')) {
    return path;
  }
  return `file://${path}`;
}
