# Gym Apk

App Android 100% offline para gestionar planes de entrenamiento de gimnasio.
React Native CLI (bare) + TypeScript + SQLite (Drizzle ORM + op-sqlite).

Ver la especificación funcional y técnica completa en [`DOCS/SPEC.md`](./DOCS/SPEC.md).
Historial de versiones en [`CHANGELOG.md`](./CHANGELOG.md).

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
    sección "Emulador Android" más abajo, con el paso a paso por UI o por
    línea de comandos)

## Setup

```bash
npm install
npm run db:generate   # solo si se modificó src/db/schema/
```

### API key de ExerciseDB (opcional, para el GIF del detalle de ejercicio)

El detalle de ejercicio (imagen/GIF + instrucciones) usa el plan gratuito de
[ExerciseDB en RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/pricing)
(690 requests/mes, sin tarjeta). Sin esto la app funciona igual —
offline-first, como siempre— solo que el detalle muestra la miniatura
estática sin GIF.

```bash
cp src/config/apiKeys.example.ts src/config/apiKeys.ts
# completar EXERCISEDB_RAPIDAPI_KEY con tu key gratuita (ver instrucciones en el archivo)
```

`src/config/apiKeys.ts` está gitignoreado — nunca se commitea.

## Desarrollo

```bash
npm start             # Metro bundler
npm run android       # build + instalar en emulador/dispositivo
```

Si la build falla o se cuelga (compilación nativa, NDK, etc.), ver
[`DOCS/ANDROID_BUILD_TROUBLESHOOTING.md`](./DOCS/ANDROID_BUILD_TROUBLESHOOTING.md).

### Emulador Android

Hace falta un AVD (Android Virtual Device) creado al menos una vez. Se puede
crear con la UI de Android Studio o por línea de comandos — elegí la opción
que prefieras, el resultado es el mismo AVD en ambos casos.

#### Opción A: desde Android Studio (Device Manager)

1. Abrir Android Studio con este proyecto (o cualquier proyecto).
2. Abrir el panel **Device Manager** (ícono de celular en la barra lateral
   derecha, o menú `Tools → Device Manager`).
3. Click en **+ (Add a new device) → Create Virtual Device**.
4. Elegir una categoría (**Phone**) y un perfil de hardware (ej. `Pixel 6` o
   `Medium Phone`) → **Next**.
5. En "System Image", elegir la imagen que corresponda a `targetSdkVersion`/
   `compileSdkVersion` (ver `android/build.gradle` — API 36/37). Si no está
   descargada, aparece un ícono de descarga (↓) al lado; descargarla y
   esperar a que termine → **Next**.
6. Confirmar el nombre del AVD (por defecto usa el perfil elegido, ej.
   `Medium_Phone`) y click **Finish**.
7. El AVD ya queda listado en el Device Manager, con un botón ▶ para
   levantarlo cuando haga falta (ver "Levantar el emulador" más abajo — es
   el mismo paso sin importar cómo se haya creado).

#### Opción B: por línea de comandos

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

**Levantar el emulador** (mismo paso sin importar si el AVD se creó por la
Opción A o la B — alternativa al botón ▶ del Device Manager):

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

## Compilar para distintas arquitecturas

Android soporta 4 arquitecturas de CPU (ABIs). Cualquier build (debug o release)
compila las 4 por defecto, pero durante desarrollo conviene acotarlo a una sola
con `-PreactNativeArchitectures=<abi>` — mucho más rápido y evita el problema de
compilación paralela documentado en
[`DOCS/ANDROID_BUILD_TROUBLESHOOTING.md`](./DOCS/ANDROID_BUILD_TROUBLESHOOTING.md).

| ABI           | Cuándo usarla                                              |
|---------------|-------------------------------------------------------------|
| `x86_64`      | Emulador de Android Studio (el más común hoy)                |
| `x86`         | Emuladores viejos de 32 bits (raro)                          |
| `arm64-v8a`   | Celulares reales de los últimos ~8 años (la gran mayoría)    |
| `armeabi-v7a` | Celulares reales viejos de 32 bits                           |

Ver la arquitectura de un dispositivo ya conectado:
```bash
adb -s <device> shell getprop ro.product.cpu.abi
```

### Debug (para desarrollo — necesita Metro corriendo)

```bash
cd android
./gradlew installDebug -Dorg.gradle.workers.max=1 -PreactNativeArchitectures=x86_64
# o -PreactNativeArchitectures=arm64-v8a para instalar en un celular real
```

`npm run android` hace lo mismo pero sin acotar arquitectura ni pasar el flag de
workers — más lento y más propenso al problema de compilación descrito en el
troubleshooting; usalo solo si no te encontraste con ese problema.

### Release (APK standalone, instalable en cualquier celular, sin Metro)

```bash
cd android
./gradlew assembleRelease -Dorg.gradle.workers.max=1
```

Genera un APK **universal** (con las 4 arquitecturas embebidas, ~85 MB) en
`android/app/build/outputs/apk/release/app-release.apk`. El JS queda empaquetado
dentro del APK — no depende de Metro ni de que la compu esté prendida — y se
firma con el keystore de debug, algo intencional: este proyecto se distribuye
solo por sideload manual, no por Google Play (ver `DOCS/SPEC.md` sección 11).

Para un release más liviano de una sola arquitectura (por ejemplo, para mandarlo
directo a tu propio celular), agregá el mismo flag que en debug:

```bash
./gradlew assembleRelease -Dorg.gradle.workers.max=1 -PreactNativeArchitectures=arm64-v8a
```

Instalar el resultado en un dispositivo ya conectado por `adb`:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Calidad

```bash
npm run lint
npm run typecheck
npm test
```

## Estado

**v1 cerrada (0.0.1)** — Fases 0 a 6 completas y mergeadas a `main` (setup,
catálogo, planes, sesión de entrenamiento, historial/progreso/peso corporal,
ajustes/tema/backup, superseries/ejercicios personalizados/recordatorio
diario).

**Fase 7 concluida** — pulido de UX y estabilidad post-v1: iconos reales en
el tab bar, acciones de listas (editar/eliminar/etc.) ocultas detrás de un
gesto de swipe, y varias correcciones (nombre de ruta duplicado, ruido de
Reanimated en consola, un bug de integridad referencial al eliminar un
ejercicio/día/plan con series de sesión ya registradas).

**Detalle de ejercicio con GIF** (issue #24) — pantalla de detalle con
imagen/GIF grande, instrucciones, grupo muscular y equipo, enganchada desde
el catálogo, el selector de ejercicios de un plan y la sesión en curso. El
GIF viene del plan gratuito de ExerciseDB (RapidAPI) y se cachea localmente
para siempre tras la primera descarga (ver "API key de ExerciseDB" arriba).

Ver [`CHANGELOG.md`](./CHANGELOG.md) para el detalle de qué incluye cada
versión y la sección 9 de `DOCS/SPEC.md` para el detalle de fases y lo
pendiente para v2.
