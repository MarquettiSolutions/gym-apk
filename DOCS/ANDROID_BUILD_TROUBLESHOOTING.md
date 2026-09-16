# Troubleshooting de build/deploy Android

> Registro de problemas reales encontrados al correr `npm run android` en este proyecto
> y cómo se resolvieron. Fecha: 2026-09-16.

## 1. `npm run android` se queda "colgado" sin logs (primera vez)

**Síntoma:** el comando no muestra progreso durante varios minutos, parece congelado.

**Causa:** la primera compilación nativa dispara la descarga del NDK de Android
(varios cientos de MB) y luego compila código C++ de los módulos nativos
(op-sqlite, notifee, react-native-video, etc.). El CLI de React Native no
muestra progreso detallado de esto por defecto, así que da la sensación de
estar colgado cuando en realidad está trabajando.

**Solución:** esperar (puede tardar 5-15 min la primera vez). Las siguientes
builds son mucho más rápidas porque el NDK y las dependencias de Gradle quedan
cacheados. Si querés ver el progreso real en vez de esperar a ciegas, correlo
directo con Gradle en modo verbose:

```bash
cd android
./gradlew installDebug --console=plain
```

## 2. Crash de `clang++` durante la compilación nativa (`exit code 139` / segfault)

**Síntoma:** la build falla con algo como:

```
FAILURE: Build failed with an exception.
> Execution failed for task ':app:buildCMakeDebug[arm64-v8a]'.
clang++: error: clang frontend command failed with exit code 139 (use -v to see invocation)
PLEASE submit a bug report to https://github.com/android-ndk/ndk/issues ...
```

Suele fallar en un archivo `.cpp` distinto cada vez (a veces op-sqlite, a veces
react-native-screens, a veces safe-area-context), lo cual es la pista de que
**no es un bug del código** sino un problema de estabilidad del compilador del
NDK (27.1.12297006, con optimizaciones +BOLT/+PGO) bajo compilación paralela
(Ninja con `-j8`, un job por núcleo).

**Solución:** limitar el paralelismo de Gradle a 1 worker. También conviene
compilar solo para la arquitectura del emulador (`x86_64` en los emuladores
estándar de Android Studio) en vez de las 4 arquitecturas por defecto — mucho
más rápido y evita el crash:

```bash
cd android
./gradlew installDebug -Dorg.gradle.workers.max=1 -PreactNativeArchitectures=x86_64
```

Si vas a probar en un celular físico (normalmente `arm64-v8a`), cambiá el
valor de `reactNativeArchitectures`. Si el crash reaparece incluso con 1
worker, probá de nuevo (es intermitente) antes de asumir que es otra cosa.

## 3. Pantalla en blanco al abrir la app

**Causa:** Metro (el bundler de JS) no está corriendo, o se cayó. La app debug
necesita a Metro sirviendo el bundle en tiempo real; sin él no puede renderizar
nada.

**Solución:**

```bash
npm start   # o: npx react-native start --port 8081
adb reverse tcp:8081 tcp:8081   # solo necesario si usás emulador y no se hizo antes
```

Después reabrí la app (o relanzá con `adb shell am start -n
com.marquettisolutions.gymapk/.MainActivity`).

## 4. `TypeError: undefined is not a function` al iniciar la app (bug real, ya arreglado)

**Síntoma:** la app carga el bundle, muestra "Cargando..." y después tira un
error no manejado apenas arranca `initDatabase()`.

**Causa:** incompatibilidad de versiones entre `drizzle-orm@0.45.2` y
`@op-engineering/op-sqlite@18.2.3`. El propio `package.json` de `drizzle-orm`
declara que fue desarrollado/testeado contra op-sqlite `^2.0.16` — 16 versiones
mayores de diferencia. Entre esas versiones, op-sqlite cambió el formato de
retorno de `execute()`/`executeRaw()` (de arrays planos a objetos
`{ rows, rawRows, columnNames, ... }`), y el driver `drizzle-orm/op-sqlite`
nunca se actualizó para ese cambio. Resultado: **cualquier** `db.select(...)`
rompía, porque `drizzle` intentaba hacer `.map()` sobre un objeto que no es un
array.

**Solución aplicada:** se parcheó `node_modules/drizzle-orm/op-sqlite/session.js`
para extraer `result.rows` / `result.rawRows` correctamente antes de
devolverlos. El parche se persiste con
[`patch-package`](https://github.com/ds300/patch-package) — ver
`patches/drizzle-orm+0.45.2.patch`. Se aplica automáticamente en cada
`npm install` gracias al script `postinstall` en `package.json`. **No hace
falta hacer nada manual**: si en algún momento `npm install` no corre el
`postinstall` (por ejemplo, con `--ignore-scripts`), correr `npx patch-package`
a mano.

**A futuro:** si se actualiza `drizzle-orm` a una versión que ya soporte
op-sqlite v18+ nativamente (revisar el changelog / los release candidates
`1.0.0-rc.*`), este parche debería eliminarse y volver a generarse si hiciera
falta, o borrarse directamente si el bug ya no existe en la nueva versión.

## 5. Flujo de trabajo normal para iterar

- **Cambios de JS/TS** (pantallas, lógica, estilos): con Metro corriendo, se
  recargan solos (Fast Refresh) al guardar el archivo. No hace falta reinstalar
  nada.
- **Cambios que sí requieren rebuild nativo** (no alcanza con Fast Refresh):
  - Agregar o actualizar una librería con código nativo.
  - Tocar archivos dentro de `android/` (Gradle, `AndroidManifest.xml`, etc.).
  - Cambiar `android/gradle.properties`.

  En esos casos, correr de nuevo `npm run android` (o el comando de
  `gradlew installDebug` de la sección 2 si vuelve a fallar la compilación
  nativa).
