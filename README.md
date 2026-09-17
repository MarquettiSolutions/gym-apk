# Gym Apk

App Android 100% offline para gestionar planes de entrenamiento de gimnasio.
React Native CLI (bare) + TypeScript + SQLite (Drizzle ORM + op-sqlite).

Ver la especificación funcional y técnica completa en [`DOCS/SPEC.md`](./DOCS/SPEC.md).

## Requisitos

- Node 22+
- JDK 17
- Android Studio, con estos componentes instalados desde el SDK Manager
  (`Android Studio → More Actions → SDK Manager`, o por línea de comandos con
  `sdkmanager` — las versiones exactas están en `android/build.gradle`):
  - **Android SDK Platform** para `compileSdkVersion` (37) y `targetSdkVersion` (36)
  - **Android SDK Build-Tools** `37.0.0`
  - **NDK (Side by side)** `27.1.12297006` (compilación nativa de op-sqlite,
    notifee, react-native-video, reanimated y demás módulos nativos)
  - **Android Emulator** + una imagen de sistema y un AVD creado (ver la
    sección "Emulador Android por línea de comandos" más abajo para
    crearlo/levantarlo sin abrir el IDE)

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

### Emulador Android por línea de comandos

Android Studio es solo una interfaz sobre las herramientas del SDK
(`sdkmanager`, `avdmanager`, `emulator`, `adb`); se puede crear y levantar un
emulador sin abrirlo nunca.

**Crear el AVD (una sola vez):**

```bash
# Instalar la imagen de sistema (elegí la que corresponda a tu arquitectura)
sdkmanager "system-images;android-36;google_apis;x86_64"

# Crear el AVD
avdmanager create avd -n Medium_Phone \
  -k "system-images;android-36;google_apis;x86_64" -d "pixel_6"
```

Los AVD quedan guardados en `$ANDROID_AVD_HOME` (por defecto `~/.android/avd`,
pero según cómo se instaló Android Studio puede estar en
`~/.config/.android/avd`). Si `emulator -list-avds` no muestra el que ya
creaste desde el IDE, exportá la variable apuntando a esa carpeta:

```bash
export ANDROID_AVD_HOME=~/.config/.android/avd   # solo si hace falta
emulator -list-avds
```

**Levantar el emulador:**

```bash
emulator -avd Medium_Phone -netdelay none -netspeed full &
```

Una vez arriba, aparece como cualquier dispositivo conectado:

```bash
adb devices -l
adb reverse tcp:8081 tcp:8081   # solo la primera vez, para que la app llegue a Metro
```

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
