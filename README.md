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

## Calidad

```bash
npm run lint
npm run typecheck
npm test
```

## Estado

Fase 0 (setup del proyecto) completa. Ver la sección 9 de `DOCS/SPEC.md` para
las fases siguientes.
