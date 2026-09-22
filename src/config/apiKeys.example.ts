// Referencia — `src/config/apiKeys.ts` (el archivo real que importa el
// código) ya existe trackeado en git con el mismo shape, vacío por defecto.
// Para cargar tu key local sin riesgo de commitearla:
//   1. Completá EXERCISEDB_RAPIDAPI_KEY en `src/config/apiKeys.ts` (no en
//      este archivo) con tu key real.
//   2. Corré una sola vez: git update-index --skip-worktree src/config/apiKeys.ts
//      Esto hace que git ignore cambios futuros en ESE archivo puntual, sin
//      afectar a nadie más que clone el repo (ven el placeholder vacío).
//
// EXERCISEDB_RAPIDAPI_KEY: key gratuita de RapidAPI para el detalle de
// ejercicio con GIF (spec 5.2/5.3, DOCS/SPEC.md sección 11). Conseguirla:
//   1. Crear una cuenta gratis en https://rapidapi.com
//   2. Suscribirse al plan Basic ($0.00) de:
//      https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing
//   3. Copiar el header "X-RapidAPI-Key" desde el dashboard de tu app.
//
// Sin esta key, la app funciona igual (offline-first) — simplemente no se
// completa `video_remote_url` en el catálogo y el detalle de ejercicio
// muestra solo la miniatura estática, sin GIF.
export const EXERCISEDB_RAPIDAPI_KEY = '';
