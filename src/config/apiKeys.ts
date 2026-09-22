// Placeholder trackeado en git con valor vacío por defecto — así el módulo
// siempre existe y `tsc`/Metro resuelven el import en cualquier clon nuevo o
// en CI, aunque nadie haya cargado una key todavía.
//
// Para cargar tu propia key local SIN riesgo de commitearla por error:
//   1. Completá EXERCISEDB_RAPIDAPI_KEY acá abajo con tu key real.
//   2. Corré una sola vez: git update-index --skip-worktree src/config/apiKeys.ts
//      (le dice a git que ignore cambios futuros en ESTE archivo puntual,
//      sin tocar .gitignore — el placeholder vacío sigue siendo lo que ve
//      cualquier otro clon del repo).
//
// Ver `apiKeys.example.ts` para instrucciones completas de cómo conseguir la
// key gratuita.
export const EXERCISEDB_RAPIDAPI_KEY = '';
