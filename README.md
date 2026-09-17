# Gym Apk

App Android 100% offline para gestionar planes de entrenamiento de gimnasio.
React Native CLI (bare) + TypeScript + SQLite (Drizzle ORM + op-sqlite).

Ver la especificación funcional y técnica completa en [`DOCS/SPEC.md`](./DOCS/SPEC.md).

## Requisitos

- Node 22+
- JDK 17
- Android Studio con SDK y un emulador (o dispositivo físico) configurado

## Setup

```bash
npm install
npm run db:generate   # solo si se modificó src/db/schema/
```

## Desarrollo

```bash
npm start             # Metro bundler
npm run android       # build + instalar en emulador/dispositivo
```

Si la build falla o se cuelga (compilación nativa, NDK, etc.), ver
[`DOCS/ANDROID_BUILD_TROUBLESHOOTING.md`](./DOCS/ANDROID_BUILD_TROUBLESHOOTING.md).

Antes de cerrar una fase nueva, recorrer
[`DOCS/REGRESSION_CHECKLIST.md`](./DOCS/REGRESSION_CHECKLIST.md) en el emulador (spec 9.2) para
confirmar que no se rompió nada de fases anteriores.

## Calidad

```bash
npm run lint
npm run typecheck
npm test
```

## Estado

Fases 0 a 6 completas y mergeadas a `main` (setup, catálogo, planes, sesión
de entrenamiento, historial/progreso/peso corporal, ajustes/tema/backup,
superseries/ejercicios personalizados/recordatorio diario). Ver la sección 9
de `DOCS/SPEC.md` para el detalle y las fases siguientes.
