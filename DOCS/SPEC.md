# Especificación funcional y técnica — Gym Apk

> Documento base para que un agente de IA (u otro desarrollador) implemente la aplicación desde cero.
> Versión: 0.1 (borrador inicial) — Fecha: 2026-09-16

## 1. Resumen del proyecto

Aplicación Android (React Native) para gestionar planes de ejercicio de gimnasio, 100% local
(sin backend, sin cuenta de usuario, sin costo), pensada como alternativa gratuita a apps de pago
tipo "Strong", "Hevy" o "MuscleWiki". El usuario arma un plan semanal de ejercicios (uno o varios
días), y luego "ejecuta" ese plan día a día marcando series/ejercicios como completados, con
temporizador de descanso configurable entre series. Cada ejercicio muestra una miniatura y,
al abrir el detalle, un video corto demostrativo.

## 2. Objetivos y no objetivos

### Objetivos
- Crear y editar un plan de entrenamiento semanal recurrente (se repite cada semana indefinidamente).
- Ejecutar una sesión de entrenamiento del día con checklist de series y temporizador de descanso.
- Consultar cómo se ejecuta un ejercicio (imagen + video corto) sin depender de servicios de pago.
- Guardar historial de sesiones completadas (para ver progreso en el tiempo).
- Funcionar 100% offline tras la instalación/primera carga de datos.

### No objetivos (fuera de alcance v1)
- Cuentas de usuario, login, sincronización en la nube, multi-dispositivo.
- Planes de nutrición/dieta.
- Rutinas generadas automáticamente por IA (se puede evaluar en versiones futuras).
- Publicación en Google Play (a evaluar más adelante; v1 es APK instalable directamente).

## 3. Usuarios y caso de uso principal

Usuario único, sin roles. Flujo típico:

1. El usuario crea su plan semanal una vez: elige qué días entrena (ej. lunes, miércoles, viernes)
   y qué ejercicios va en cada día, con series/repeticiones objetivo y tiempo de descanso.
2. Cada semana, ese plan se repite automáticamente (no hay que volver a crearlo).
3. El día que toca entrenar, abre la app, ve el entrenamiento del día y va marcando cada serie
   como hecha; entre series/ejercicios corre un temporizador de descanso.
4. Puede tocar un ejercicio para ver su video demostrativo antes o durante el entrenamiento.
5. Al terminar, la sesión queda guardada en el historial.

## 4. Stack técnico y arquitectura

### 4.1 Framework y lenguaje
- **React Native CLI (bare)** + **TypeScript** en modo estricto. **Decisión tomada** (ver
  justificación abajo; reemplaza la duda inicial entre Expo y RN CLI).
- **Por qué RN CLI puro y no Expo:**
  - El temporizador de descanso debe seguir funcionando con precisión aunque la app esté en
    background o la pantalla apagada, disparando una notificación exacta al finalizar. Esto
    requiere un **foreground service** en Android y control fino de `AndroidManifest.xml`/Gradle,
    algo más directo de manejar en bare RN que a través de config plugins de Expo.
  - La app es **solo Android**; la mayor ventaja de Expo (paridad fácil con iOS) no aplica.
  - Se planea una futura migración/reaprovechamiento hacia un backend web (ver sección 4.3):
    conviene mantener el proyecto nativo sin capas de abstracción adicionales que compliquen
    cambios futuros en build, notificaciones o tareas en background.
  - El desarrollador tiene experiencia manejando configuración nativa compleja, por lo que el
    mayor esfuerzo inicial de setup de RN CLI no es un problema y se gana control total.

**Librerías concretas recomendadas** (para que el agente de implementación no tenga que decidir
esto de cero):
- **Reproducción de video/GIF**: `react-native-video` para archivos de video (mp4). Si el
  proveedor de contenido sirve GIFs animados en vez de mp4, evaluar convertirlos a mp4 corto en
  el momento de la descarga (mejor rendimiento y menor consumo de batería que un GIF animado
  grande) o usar `react-native-fast-image` si se decide mantenerlos como GIF.
- **Descarga y almacenamiento de archivos** (para el cache de video bajo demanda descrito en
  5.2): `react-native-blob-util` (o `react-native-fs`) para descargar el video a almacenamiento
  interno de la app y guardar la ruta local en `exercises.video_local_path`.
- **Notificaciones locales / temporizador de descanso preciso en background**:
  `@notifee/react-native`, que permite programar una notificación exacta a futuro (basada en
  timestamp real, no en `setInterval`) y sigue funcionando con la app en background o la
  pantalla apagada — más confiable para este caso que la API de notificaciones básica de RN.
- **Permisos de Android a declarar**: `INTERNET` (importación de catálogo y descarga de video),
  `POST_NOTIFICATIONS` (obligatorio desde Android 13 para el aviso de fin de descanso),
  `VIBRATE`, y si se usa un foreground service para el temporizador,
  `FOREGROUND_SERVICE`/`FOREGROUND_SERVICE_SPECIAL_USE` según la versión de Android objetivo.
- **Riesgo conocido a tener en cuenta**: algunos fabricantes (Xiaomi/MIUI, Huawei, algunos
  Samsung) matan agresivamente procesos/servicios en background pese a los permisos correctos;
  no hay forma 100% garantizada de evitarlo desde código, solo mitigarlo (foreground service +
  notificación persistente mientras hay un descanso corriendo). Vale la pena probar en un
  dispositivo físico real, no solo emulador, antes de dar por cerrada esta feature.

### 4.2 Arquitectura de la app (feature-based / capas)
Estructura recomendada dentro de `src/`:

```
src/
  app/                # Entry point, navegación raíz, providers globales
  navigation/         # React Navigation: stacks, tabs, tipos de rutas
  features/
    plans/            # Crear/editar plan semanal
      components/
      hooks/
      screens/
      services/       # acceso a datos vía repositorios
      types.ts
    workout-session/   # Ejecución de una sesión de entrenamiento (checklist + timer)
    exercises/          # Catálogo de ejercicios, detalle con video/imagen
    history/            # Historial y progreso
    settings/            # Preferencias (descanso por defecto, unidades, tema)
  db/
    schema/              # Definición de tablas
    migrations/
    client.ts            # Instancia de la DB
    repositories/         # Capa de acceso a datos (PlansRepository, ExercisesRepository...)
  shared/
    components/           # UI genérica (Button, Card, ProgressBar...)
    hooks/
    theme/
    utils/
  assets/
    exercise-thumbnails/  # Imágenes locales empaquetadas (o cache descargado)
```

Principios:
- **Arquitectura por capas dentro de cada feature**: `screens` (UI) → `hooks` (lógica de
  presentación/estado) → `services`/`repositories` (acceso a datos) → `db` (SQLite). La UI nunca
  llama a SQL directamente.
- **Repository pattern** para aislar SQLite: si más adelante se cambia de librería de DB o se
  añade sync, solo cambian los repositorios.
- **State management**: Zustand (ligero, recomendado) o Redux Toolkit para estado global
  (ej. sesión de entrenamiento en curso, timer). React Query/TanStack Query no es imprescindible
  al ser todo local, pero puede usarse para cachear lecturas de SQLite con invalidación simple.
- **Navegación**: React Navigation (Bottom Tabs: *Plan de hoy*, *Mis planes*, *Ejercicios*,
  *Historial*, *Ajustes*).
- **Testing**: Jest + React Native Testing Library para componentes/hooks; tests unitarios para
  repositorios de SQLite (usando una DB en memoria).
- **Calidad**: ESLint + Prettier + TypeScript strict + Husky (pre-commit lint/test).

### 4.3 Base de datos local — diseño relacional pensado para migrar a servidor

Requisito clave: hoy es SQLite local, pero **a futuro se va a migrar/reaprovechar este modelo en
un backend web** (probablemente Postgres/MySQL). Esto condiciona varias decisiones de diseño desde
ahora, para no tener que rehacer el esquema más adelante:

- **Claves primarias como UUID (TEXT), no `INTEGER AUTOINCREMENT`.** Generadas en el cliente
  (`uuid v4`). Motivo: si en el futuro hay múltiples dispositivos o se sincroniza contra un
  servidor, los IDs autoincrementales chocan entre sí; los UUID se pueden fusionar sin conflicto
  y son el mismo tipo de dato en SQLite y en Postgres/MySQL.
- **Tabla `users` desde ahora**, aunque v1 sea un solo usuario local sin login. Se crea un único
  registro "usuario local" con un id fijo, y **todas las tablas relevantes llevan `user_id`**
  desde el día 1. Motivo: agregar `user_id` retroactivamente a todas las tablas el día que exista
  un servidor multiusuario es una migración dolorosa; hacerlo desde ahora cuesta cero y deja el
  modelo listo.
- **`created_at` y `updated_at` (ISO-8601, UTC) en todas las tablas**, para auditoría y para que
  una futura sincronización pueda resolver conflictos por fecha.
- **Claves foráneas activas** (`PRAGMA foreign_keys = ON`) y normalización estándar (3FN): sin
  columnas JSON para datos estructurados que en un server relacional deberían ser su propia tabla.
- **Tablas de historial = solo inserción (append-only), nunca UPDATE/DELETE de los valores
  históricos.** Esto es lo que pediste para el tracking de peso: cada vez que el usuario registra
  un peso nuevo (corporal o de un ejercicio), se **inserta una fila nueva**; el "peso actual" es
  simplemente la fila más reciente de esa serie histórica. El registro anterior nunca se borra ni
  se sobrescribe, quedando disponible para gráficos de evolución. Aplica a `body_weight_logs` y a
  `workout_session_sets`.
- **ORM recomendado: Drizzle ORM.** Su forma de definir esquemas es prácticamente la misma para
  SQLite, Postgres y MySQL (cambia el driver, no la forma de escribir las tablas). Esto significa
  que, al migrar a un backend web, gran parte del esquema (`src/db/schema/*`) se puede **reutilizar
  casi tal cual**, apuntándolo a Postgres en vez de SQLite — que es exactamente el objetivo que
  mencionaste. Alternativa si se prefiere no usar ORM: SQL crudo + repositorios a mano, pero se
  pierde esa reutilización directa del esquema.
- Migraciones versionadas desde el día 1 (Drizzle incluye su propio sistema de migraciones).

### 4.4 Modelo de datos (borrador, con IDs tipo UUID y `user_id` en todas las tablas)

```
users
  id (uuid, PK), display_name, created_at, updated_at
  -- v1: un único registro "usuario local"; deja el modelo listo para multiusuario en servidor.

exercises
  id (uuid, PK), name, muscle_group, equipment, instructions,
  thumbnail_remote_url, thumbnail_local_path,           -- se descarga y cachea al importar el catálogo
  video_source (ej. 'exercisedb'), video_remote_url,
  video_local_path (nullable), video_cached_at (nullable), -- video se descarga bajo demanda, al abrir el detalle
  is_custom (bool), created_by_user_id (FK -> users, nullable), created_at, updated_at

plans
  id (uuid, PK), user_id (FK -> users), name, is_active, created_at, updated_at

plan_days
  id (uuid, PK), plan_id (FK -> plans), weekday (0-6), label, created_at, updated_at
  -- ej: label "Día A - Empuje"

plan_day_exercises
  id (uuid, PK), plan_day_id (FK -> plan_days), exercise_id (FK -> exercises), order_index,
  target_sets, target_reps, target_weight (nullable), rest_seconds (default 30), notes,
  created_at, updated_at

workout_sessions
  id (uuid, PK), user_id (FK -> users), plan_day_id (FK -> plan_days, nullable si se borró el plan),
  started_at, finished_at, status, created_at
  -- Registro histórico: no se edita después de finalizada, solo se crea.

workout_session_sets
  id (uuid, PK), session_id (FK -> workout_sessions), plan_day_exercise_id (FK -> plan_day_exercises),
  exercise_id (FK -> exercises), set_number, reps_done, weight_done, weight_unit,
  completed_at, skipped (bool), created_at
  -- APPEND-ONLY: cada serie ejecutada es una fila nueva e inmutable. La evolución del peso
  -- usado en un ejercicio a lo largo del tiempo se consulta filtrando por exercise_id y
  -- ordenando por completed_at — nunca se sobrescribe una fila anterior.

body_weight_logs
  id (uuid, PK), user_id (FK -> users), weight, weight_unit, logged_at, created_at
  -- APPEND-ONLY: tracking del peso corporal del usuario. Cada pesaje nuevo es una fila nueva;
  -- el peso "actual" es la fila con logged_at más reciente. Permite graficar subida/bajada
  -- de peso en el tiempo sin perder el historial.

settings
  key (PK), value   -- default_rest_seconds, weight_unit, theme, etc. (única tabla que sí se
  -- actualiza in-place, porque representa preferencias actuales, no hechos históricos)
```

Notas:
- `rest_seconds` a nivel de `plan_day_exercises` permite un descanso distinto por ejercicio,
  con 30s como valor por defecto configurable en Ajustes.
- Índices recomendados: `workout_session_sets(exercise_id, completed_at)` y
  `body_weight_logs(user_id, logged_at)` para que las consultas de progreso/gráficos sean rápidas.
- **Ejercicios por tiempo/duración (plancha, cardio) — fuera de alcance v1** (decisión tomada):
  el modelo (`target_reps`/`reps_done`) asume ejercicios de repeticiones. Los ejercicios que se
  miden por tiempo se cargan igual en el plan, pero sin timer propio ni tracking estructurado de
  duración — el usuario los anota "a mano" en el campo `notes` de `plan_day_exercises`
  (ej. "plancha 45s"). Se puede sumar `target_duration_seconds`/`duration_done_seconds` como
  mejora en una versión futura.
- Si el usuario comete un error al registrar un peso, la corrección **también es una fila nueva**
  (no se edita la fila anterior), salvo que la sesión siga "en curso" (no finalizada), donde sí
  se permite corregir la fila recién creada antes de cerrar la sesión.
- **Unidad de peso por registro, no solo global**: tanto `workout_session_sets.weight_unit` como
  `body_weight_logs.weight_unit` guardan la unidad con la que se cargó ese registro puntual. Si
  el usuario cambia la preferencia global de unidad en Ajustes más adelante, los registros
  históricos **no se convierten ni se reescriben**; la UI convierte al vuelo para mostrarlos en
  la unidad preferida actual, pero el dato crudo guardado nunca cambia.

## 5. Funcionalidades detalladas

### 5.1 Gestión del plan semanal
- Alta inicial: el usuario define los días de entrenamiento de la semana y, para cada día,
  selecciona ejercicios desde el catálogo (buscador + filtro por grupo muscular/equipo).
- Por cada ejercicio en el día: número de series, repeticiones objetivo, peso objetivo (opcional),
  segundos de descanso (por defecto 30s, editable por ejercicio y globalmente en Ajustes).
- El plan se repite automáticamente cada semana (no hay "fecha de fin"); editar el plan afecta
  las semanas futuras, no el historial ya registrado.
- Reordenar ejercicios dentro de un día (drag & drop).
- Editar/duplicar/eliminar días o el plan completo. Soporte para más de un plan guardado, con
  uno marcado como "activo".

### 5.2 Catálogo de ejercicios y contenido multimedia
**Contexto legal (por qué no se usa MuscleWiki directamente):** "MuscleWiki" es un producto
comercial y **no ofrece una API pública/gratuita** para integrarse en apps de terceros — usar su
contenido sin licencia sería un problema legal. Alternativas reales, gratuitas y con licencias
permisivas investigadas para este documento:

| Fuente | Contenido | Licencia | Notas |
|---|---|---|---|
| [free-exercise-db](https://github.com/yuhonas/free-exercise-db) | ~800 ejercicios, imágenes (secuencia de fotos, no video), JSON | Dominio público | Ideal para empaquetar offline; sin video, pero sirve para las miniaturas. |
| [wger](https://github.com/wger-project/wger) | Base de datos de ejercicios + API REST propia (self-hosted, AGPL-3.0) | Open source | Tiene imágenes en varios casos, no gifs/video animado. Se puede auto-alojar o usar su instancia pública con atención a límites de uso. |
| [ExerciseDB (RapidAPI / API pública)](https://github.com/exercisedb/exercisedb-api) | +1000 ejercicios con GIF/imagen y a veces video | Verificar términos según el proveedor usado | Buena cobertura de animaciones tipo "cómo se hace"; revisar cuota gratuita y términos de uso antes de integrar. |
| Wikimedia Commons | Videos/GIFs de ejercicios sueltos, calidad variable | Licencias libres (CC/dominio público, varían por archivo) | Cobertura incompleta; útil como complemento, no como fuente única. |

**Decisión para v1: video/GIF desde el día 1**, usando **ExerciseDB** (o un proveedor equivalente
con GIF/video + metadata en un mismo dataset) como fuente única del catálogo. Se prefiere un
único proveedor para catálogo + multimedia (en vez de mezclar `free-exercise-db` para imágenes
con otra API distinta para video) para evitar el problema de tener que "matchear" ejercicios
entre dos datasets con nombres/IDs distintos. *(Nota de implementación: al elegir el proveedor
concreto, confirmar su cuota gratuita, límites de rate-limit y términos de uso comercial/apps
antes de integrarlo en código.)*

**Estrategia de descarga y cache (para mantener el espíritu offline-first el máximo posible):**
- **Importación del catálogo** (nombres, grupo muscular, equipo, miniatura): se sincroniza una
  vez la primera vez que se abre la app (requiere conexión a internet ese primer uso), y se
  guarda localmente en SQLite + almacenamiento del dispositivo. Las miniaturas se descargan y
  cachean en ese mismo momento (son livianas).
- **El video/GIF de cada ejercicio se descarga bajo demanda**, la primera vez que el usuario
  abre el detalle de ese ejercicio puntual (no se descargan los 1000+ videos del catálogo de
  entrada, para no gastar datos/espacio de más). Una vez descargado, se guarda en el
  almacenamiento local del dispositivo y las próximas veces se reproduce **sin conexión**.
- Si el usuario abre un ejercicio sin video cacheado y sin conexión a internet, se muestra la
  miniatura/imagen estática con un aviso de "conectate para ver el video la primera vez", sin
  bloquear el resto de la app (que sigue funcionando 100% offline).
- Modelo de datos: la tabla `exercises` guarda `video_remote_url` (referencia al proveedor),
  `video_local_path` (nulo hasta que se descarga) y `video_cached_at`; la UI siempre prioriza
  `video_local_path` si existe.
- **Gestión de espacio del cache de video**: como el catálogo puede tener miles de ejercicios,
  no hay límite automático de cuántos se pueden cachear (el usuario solo descarga los que
  realmente usa, al abrir su detalle). Se recomienda agregar en Ajustes una opción manual
  "Liberar espacio de videos descargados" que borra `video_local_path`/`video_cached_at` de
  ejercicios no usados recientemente, sin tocar ningún dato de planes/historial/peso.

Reglas de negocio:
- La miniatura pequeña (imagen estática, ya cacheada desde la importación del catálogo) se
  muestra siempre en la lista de ejercicios del plan/sesión, incluso sin conexión.
- El video/GIF demostrativo **solo se descarga/reproduce al abrir el detalle del ejercicio**
  (no precargar todos los videos al iniciar la sesión, para ahorrar datos/espacio).
- Permitir agregar ejercicios personalizados (nombre + foto/video propio desde la galería del
  teléfono) para cubrir huecos del catálogo; estos son 100% locales desde el inicio, sin
  depender de ninguna API.

### 5.3 Ejecución de la sesión de entrenamiento (feature clave)
- Pantalla "Entrenamiento de hoy" basada en el día de la semana actual y el plan activo.
- Lista de ejercicios del día, cada uno con miniatura, nombre, series objetivo (ej. "4x10").
- Al tocar un ejercicio se abre el detalle con imagen/video de cómo ejecutarlo correctamente.
- Cada serie se marca individualmente como completada (checkbox/swipe); se puede registrar
  reps y peso reales usados (opcional pero recomendado para progreso).
- **Pre-cargar como sugerencia el último peso/reps registrados** para ese mismo ejercicio (la
  fila más reciente en `workout_session_sets`), para que el usuario no tenga que recordarlo ni
  tipearlo de cero cada sesión — puede aceptarlo tal cual o modificarlo antes de confirmar la serie.
- Al registrar reps/peso de una serie, el peso queda guardado como un **registro histórico nuevo**
  (nunca se sobrescribe un registro anterior — ver `workout_session_sets` en 4.4), de forma que
  se pueda ver la evolución del peso usado en cada ejercicio a lo largo del tiempo (ej. "cuánto
  levantaba en sentadilla hace 2 meses vs. hoy").
- Al completar una serie, se dispara automáticamente un **temporizador de descanso**:
  - Valor por defecto: 30 segundos (configurable de forma global en Ajustes).
  - Configurable también por ejercicio individual al armar el plan.
  - El usuario puede saltar el descanso, pausarlo, o sumar/restar tiempo (+15s/-15s).
  - Notificación/vibración/sonido al terminar el descanso (funcionando aunque la pantalla se
    apague o la app esté en background — requiere manejar temporizador con timestamp real, no
    solo `setInterval`, para que no se desincronice).
- Al completar todas las series de todos los ejercicios, la sesión se marca como terminada y
  se guarda en el historial con fecha, duración y detalle de series.
- Permitir marcar un ejercicio completo como "omitido" (por si el usuario no llega a hacerlo ese día).

### 5.4 Historial y progreso
- Calendario o lista de sesiones pasadas, con estado (completa/parcial).
- Detalle de una sesión pasada: ejercicios, series, reps y peso registrados.
- Gráfico simple de progreso por ejercicio (peso o reps a lo largo del tiempo, usando el
  historial append-only de `workout_session_sets`) — útil para sobrecarga progresiva.
- Racha de días entrenados (streak) como motivador simple.

### 5.5 Tracking de peso corporal
- Pantalla donde el usuario puede **agregar un nuevo registro de peso corporal en cualquier
  momento** (no ligado a una sesión de entrenamiento), indicando el peso y, opcionalmente, la
  fecha/hora (por defecto "ahora").
- Cada registro se guarda como una fila nueva en `body_weight_logs`; **el registro anterior nunca
  se elimina ni se sobrescribe**, para mantener el historial completo de subida/bajada de peso.
- Gráfico de evolución del peso corporal en el tiempo (línea temporal), con filtro por rango de
  fechas (última semana/mes/todo).
- El "peso actual" mostrado en la app es simplemente el registro con la fecha más reciente.
- Permite borrar un registro puntual por error de carga (acción explícita del usuario, distinta
  de una edición automática), pero no permite "editar en el lugar" el valor de un registro pasado
  una vez guardado — para evitar que se pierda la trazabilidad real del progreso.

### 5.6 Ajustes
- Descanso por defecto (segundos).
- Unidad de peso (kg/lb).
- Tema claro/oscuro (o seguir el sistema).
- Sonido/vibración del temporizador on/off.
- Exportar/importar datos (backup manual a JSON/archivo, ya que todo es local y se perdería
  si se desinstala la app). El export incluye todas las tablas de datos del usuario (planes,
  sesiones, historial, peso corporal, ejercicios personalizados y su metadata) pero **no**
  los archivos de video cacheados de `exercises` del catálogo externo (esos se vuelven a
  descargar bajo demanda tras importar); las fotos/videos de ejercicios personalizados sí se
  incluyen o se referencian en el export, al ser contenido propio del usuario sin fuente externa.

## 6. Requisitos no funcionales
- **Offline-first para todo lo propio del usuario**: planes, sesiones, historial y tracking de
  peso funcionan siempre sin conexión — nada de eso depende de red. La única dependencia de red
  es puntual y externa al núcleo de la app: la importación inicial del catálogo de ejercicios y
  la descarga bajo demanda del video de un ejercicio la primera vez que se ve (ver 5.2); una vez
  descargado, ese contenido también queda disponible offline.
- **Rendimiento del temporizador**: preciso incluso con la pantalla bloqueada/app en background
  (usar notificaciones locales programadas para el aviso de fin de descanso).
- **Accesibilidad**: tamaños de fuente escalables, contraste adecuado, soporte para lectores
  de pantalla en las acciones principales (marcar serie, iniciar descanso).
- **Idioma**: español como idioma principal de la UI (con estructura i18n para agregar otros
  idiomas después).
- **Tamaño de la APK**: cuidar el peso de los assets multimedia empaquetados (imágenes optimizadas,
  considerar descarga bajo demanda para videos si el catálogo crece mucho).

## 7. Flujos de pantalla (alto nivel)
1. **Onboarding / primera vez**: crear el primer plan semanal (wizard: elegir días → elegir
   ejercicios por día → definir series/reps/descanso).
2. **Home / Entrenamiento de hoy**: entrenamiento del día actual según el plan activo, o mensaje
   de "descanso hoy" si no hay entrenamiento planificado.
3. **Detalle de ejercicio**: imagen grande, video demostrativo, instrucciones, grupo muscular.
4. **Sesión en curso**: checklist de series + temporizador de descanso a pantalla completa entre series.
5. **Mis planes**: listado/edición de planes guardados, marcar plan activo.
6. **Historial**: lista/calendario de sesiones pasadas + progreso.
7. **Ajustes**.

## 8. Funcionalidades sugeridas para sumar al alcance (no pedidas explícitamente)
Estas son recomendaciones a evaluar y decidir si entran en v1 o quedan para v2:

- **Superseries / circuitos** (agrupar 2+ ejercicios sin descanso entre ellos).
- **RPE o nivel de esfuerzo percibido** por serie (opcional, simple 1-10).
- **Notificación/recordatorio diario** de que hoy toca entrenar según el plan.
- **Modo "descanso entre ejercicios" vs "descanso entre series"** configurables por separado.
- **Duplicar una sesión pasada** como plantilla rápida para un entrenamiento libre (fuera del plan fijo).
- **Backup/restauración** de la base de datos local (export/import a archivo, dado que no hay nube).
- **Favoritos** en el catálogo de ejercicios para armar planes más rápido.
- **Búsqueda y filtros** en el catálogo (grupo muscular, equipo necesario, sin equipo/en casa).
- **Widget/atajo** en pantalla de inicio de Android para abrir directo el entrenamiento del día.
- **Modo cronómetro con audio/vibración también al finalizar cada ejercicio**, no solo el descanso.
- **Multi-idioma** (es/en) preparado desde la arquitectura aunque v1 sea solo español.

## 9. Fases de desarrollo sugeridas
1. **Fase 0** — Setup del proyecto (React Native CLI + TS + navegación + SQLite/Drizzle + linting + CI básico).
2. **Fase 1** — Modelo de datos + repositorios + catálogo de ejercicios (import desde ExerciseDB
   o proveedor equivalente: metadata + miniaturas) + capa de descarga/cache de video bajo demanda.
3. **Fase 2** — Creación/edición de plan semanal (wizard + CRUD).
4. **Fase 3** — Ejecución de sesión: checklist de series + temporizador de descanso + registro
   de peso/reps por serie (append-only).
5. **Fase 4** — Historial, progreso y tracking de peso corporal.
6. **Fase 5** — Ajustes, backup/export, pulido de UI/UX, accesibilidad.
7. **Fase 6 (opcional)** — Notificaciones diarias, superseries, ejercicios personalizados con
   media propia.

## 10. Criterios de aceptación (v1 mínima viable)
- Se puede crear un plan semanal con al menos un día y ejercicios, y queda guardado en SQLite.
- El plan se repite automáticamente cada semana sin acción del usuario.
- La pantalla "Entrenamiento de hoy" refleja correctamente el día de la semana actual.
- Se puede completar una sesión marcando todas las series, con temporizador de descanso
  configurable (30s por defecto) funcionando correctamente entre series.
- Cada ejercicio en el plan muestra una miniatura y permite abrir un detalle con **video/GIF**
  de cómo se ejecuta, descargado la primera vez y disponible offline después.
- El historial guarda las sesiones completadas y se puede consultar después.
- Se puede agregar un registro de peso corporal en cualquier momento sin perder los anteriores.
- La app funciona sin conexión a internet para todo lo propio del usuario (planes, sesiones,
  historial, peso), salvo la importación inicial del catálogo y la primera vez que se ve el
  video de cada ejercicio puntual.

## 11. Decisiones ya tomadas
- **Framework: React Native CLI (bare)**, no Expo — ver justificación en 4.1.
- **ORM: Drizzle ORM**, por reutilización directa del esquema al migrar a un backend web — ver 4.3.
- **Registrar peso/reps reales por serie desde v1**, con historial append-only (nunca se
  sobrescribe un registro anterior) — ver 4.4 y 5.3.
- **Tracking de peso corporal como feature de v1** (append-only) — ver 5.5.
- **Modelo de datos con UUID + `user_id` en todas las tablas desde el día 1**, preparado para
  la futura migración a servidor — ver 4.3.
- **Contenido multimedia v1: video/GIF desde el día 1**, vía un proveedor externo tipo
  ExerciseDB (catálogo + video en la misma fuente). El catálogo y las miniaturas se importan y
  cachean una vez al primer uso; el video de cada ejercicio se descarga y cachea localmente la
  primera vez que se abre su detalle, quedando disponible offline después — ver 5.2.
- **Distribución: solo APK manual (sideload).** No se publica en Google Play en esta etapa; no
  aplica cumplir políticas de Play Store ni firma gestionada por Google.
- **Un solo plan activo a la vez.** Se pueden guardar varios planes, pero solo uno corre en la
  app en un momento dado; cambiar de plan activo es una acción explícita del usuario en
  "Mis planes".
- **Ejercicios por tiempo/duración (plancha, cardio) fuera de alcance v1** — se anotan a mano en
  `notes`, sin timer ni tracking estructurado; ver 4.4.

No quedan decisiones abiertas de producto para v1 — el documento está listo para pasarle a un
agente de implementación.

## 12. Referencias investigadas
- wger (proyecto open source de fitness con API propia): https://github.com/wger-project/wger
- free-exercise-db (dataset de ejercicios en dominio público): https://github.com/yuhonas/free-exercise-db
- ExerciseDB API (catálogo con GIFs/videos, revisar términos de uso): https://github.com/exercisedb/exercisedb-api
