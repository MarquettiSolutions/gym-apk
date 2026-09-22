# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Cambiado

- El menú de tabs principal ahora muestra iconos reales (Ionicons vía
  `@react-native-vector-icons/ionicons`) en lugar del recuadro vacío que dejaba
  React Navigation sin `tabBarIcon`. El ícono va relleno cuando la tab está activa
  y con contorno cuando no, y toma su color del tema claro/oscuro (#14).
- Los botones de acción de las listas (Editar, Duplicar, Activar, Eliminar, Subir,
  Bajar, Desagrupar) ya no están siempre a la vista: se muestran al deslizar la
  tarjeta hacia la izquierda, con un componente compartido (`SwipeableCard`) sobre
  `react-native-gesture-handler`. Aplica a "Mis planes", los días de un plan, los
  ejercicios de un día (incluidas las superseries, cuya cabecera desliza para
  Subir/Bajar/Desagrupar y cada ejercicio para Editar/Eliminar) y los registros de
  peso corporal. Las mismas acciones quedan disponibles para lectores de pantalla
  como acciones personalizadas de la tarjeta, sin depender del gesto (#15).
- En "Mis planes", tocar una tarjeta abre el plan (antes lo hacía el botón
  "Editar", que pasó a ser innecesario), igual que ya ocurría con los días de un
  plan (#15).

## [0.0.1] - 2026-09-18

Primera versión funcional (v1) de Gym Apk: app 100% offline para gestionar planes de
entrenamiento de gimnasio. Implementada en 7 fases (0 a 6), todas mergeadas a `main`
— ver [`DOCS/SPEC.md`](./DOCS/SPEC.md) para la especificación técnica completa y
[`DOCS/REGRESSION_CHECKLIST.md`](./DOCS/REGRESSION_CHECKLIST.md) para los flujos
verificados manualmente en cada fase.

### Agregado

**Fase 0 — Setup del proyecto**
- Proyecto React Native CLI (bare) + TypeScript en modo estricto.
- Navegación con React Navigation (bottom tabs + stacks).
- Base de datos local SQLite vía Drizzle ORM + `@op-engineering/op-sqlite`.
- Lint (ESLint + Prettier), Husky (pre-commit) y CI básico.

**Fase 1 — Modelo de datos y catálogo de ejercicios**
- Esquema de base de datos completo (UUID + `user_id` en todas las tablas desde el
  día 1, pensado para una futura migración a un backend web).
- Capa de repositorios (patrón repository) para acceso a datos.
- Importación del catálogo de ejercicios desde `free-exercise-db` (dominio
  público), con miniaturas cacheadas localmente.
- Infraestructura de descarga/cache de video bajo demanda para el detalle de
  ejercicio (sin proveedor de video conectado todavía — ver "Pendiente para v2").

**Fase 2 — Plan de entrenamiento semanal**
- Alta, edición, renombrado, duplicado y eliminación de planes.
- Días de entrenamiento por plan (día de la semana + etiqueta opcional).
- Agregar ejercicios a un día desde un buscador con filtro por grupo muscular
  (series, repeticiones, peso objetivo, descanso, notas).
- Reordenar ejercicios de un día (drag & drop y botones subir/bajar).
- Un plan activo a la vez, con cambio explícito desde "Mis planes".

**Fase 3 — Ejecución de sesión de entrenamiento**
- Pantalla "Entrenamiento de hoy" según el día de la semana actual y el plan
  activo.
- Checklist de series con registro de reps/peso reales, con historial
  append-only (nunca se sobrescribe un registro anterior).
- Sugerencia automática del último peso/reps registrados para cada ejercicio.
- Temporizador de descanso preciso (timestamp real, no `setInterval`), con
  pausa/reanudar, +15s/-15s, saltar, y notificación local al terminar
  (`@notifee/react-native`).
- Omitir un ejercicio completo (marca sus series pendientes como omitidas).

**Fase 4 — Historial y progreso**
- Listado de sesiones pasadas con estado (completa/omitida/en curso) y racha de
  días entrenados.
- Detalle de una sesión pasada (ejercicios, series, reps y peso registrados).
- Gráfico de progreso por ejercicio (peso/reps a lo largo del tiempo).
- Tracking de peso corporal append-only, con gráfico y filtros por rango de
  fechas (semana/mes/todo).

**Fase 5 — Ajustes, tema y backup**
- Preferencias configurables: descanso por defecto, unidad de peso (kg/lb),
  sonido/vibración del temporizador de descanso.
- Tema claro/oscuro/sistema aplicado a toda la app (incluida la barra de
  navegación).
- Exportar/importar backup manual a JSON, que fusiona datos sin duplicar lo ya
  existente.

**Fase 6 — Superseries, ejercicios personalizados y recordatorio diario**
- Superseries/circuitos: agrupar 2+ ejercicios de un día para que se ejecuten
  sin descanso entre ellos durante la sesión (el descanso real se dispara recién
  al cerrar la "ronda" del grupo).
- Ejercicios personalizados con foto/video propios elegidos desde la galería del
  teléfono (`react-native-image-picker`), integrados automáticamente al
  catálogo y al selector de ejercicios del plan.
- Recordatorio diario de entrenamiento configurable (hora + notificación local
  recurrente vía `notifee`, sobrevive reinicios del dispositivo sin código
  nativo adicional).

### Pendiente para v2

- Pantalla de detalle del ejercicio con video demostrativo (bloqueado por falta
  de un proveedor de video conectado al catálogo — ver `DOCS/SPEC.md` sección 13).
- Selector de fecha/hora manual al registrar un peso corporal atrasado (hoy
  siempre usa la fecha/hora actual).
- Editar o eliminar ejercicios personalizados (hoy solo se pueden crear).
- El backup no empaqueta el archivo de foto/video de ejercicios personalizados,
  solo la referencia a su ruta local en el dispositivo.

[Sin publicar]: https://github.com/MarquettiSolutions/gym-apk/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/MarquettiSolutions/gym-apk/releases/tag/v0.0.1
