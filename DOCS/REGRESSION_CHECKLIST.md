# Checklist de regresión funcional — Gym Apk

> Complementa `DOCS/SPEC.md` sección 9.2. Es la lista viva de flujos manuales a
> probar en el emulador Android **al cerrar cada fase** — no solo los flujos
> nuevos de esa fase, sino todos los acumulados hasta ahora. El objetivo es
> detectar regresiones: una fase puede compilar y pasar lint/typecheck/tests
> unitarios y aun así romper en runtime una pantalla de una fase anterior (un
> cambio transversal de tema, de esquema de DB, de navegación, de una
> constante compartida), sin que ningún test la cubra a nivel UI.

## Cómo usarlo

1. Antes de dar una fase por cerrada (spec 9.2), recorrer en el emulador cada
   ítem de este documento, de la sección "Fase 0" en adelante — no solo los
   de la fase actual.
2. Si algo falla, corregirlo en la misma rama antes de cerrar la fase (spec
   9.2) y volver a probar el ítem afectado.
3. Al terminar de implementar una fase nueva, agregar al final de este
   documento una sección con los flujos concretos que introdujo (mismo
   formato que las anteriores), para que la próxima fase también los repase.
4. Esto es una guía de qué recorrer cada vez, no un registro histórico de
   quién probó qué — no hace falta marcar los checkboxes en el commit ni
   dejarlos tildados de una corrida a la siguiente.

## Fase 0 — Setup del proyecto
- [ ] La app arranca sin crash en un emulador limpio (`am force-stop` + `am
      start`) y llega a la pantalla "Plan de hoy".
- [ ] Los 5 tabs de la barra inferior (Plan de hoy, Mis planes, Ejercicios,
      Historial, Ajustes) navegan sin crashear.

## Fase 1 — Catálogo de ejercicios
- [ ] La primera vez que arranca la app (DB vacía), se importa el catálogo de
      ejercicios sin bloquear el resto de la UI.
- [ ] Las miniaturas de ejercicios se ven en las listas que las usan (picker
      de ejercicios, plan del día, sesión en curso).

## Fase 2 — Planes semanales
- [ ] Crear un plan nuevo desde "Mis planes" (nombre + guardar).
- [ ] Agregar un día al plan (elegir día de la semana + etiqueta opcional).
- [ ] Agregar un ejercicio a un día desde el picker (buscador + filtro por
      grupo muscular), con series/reps/peso objetivo/descanso.
- [ ] Editar series/reps/peso/descanso/notas de un ejercicio ya agregado.
- [ ] Reordenar ejercicios de un día (drag & drop y botones subir/bajar).
- [ ] Activar un plan (marca "Activo", desactiva los demás).
- [ ] Duplicar un plan y duplicar un día.
- [ ] Eliminar un ejercicio de un día, eliminar un día, eliminar un plan
      completo (con confirmación).

## Fase 3 — Ejecución de sesión de entrenamiento
- [ ] "Plan de hoy" refleja el día de la semana actual según el plan activo
      (o el mensaje de "sin plan activo" / "día de descanso" si corresponde).
- [ ] Iniciar una sesión desde "Plan de hoy" (botón "Comenzar
      entrenamiento").
- [ ] Registrar una serie (reps + peso), con sugerencia pre-cargada del
      último registro de ese ejercicio si existe.
- [ ] Al registrar una serie se dispara el temporizador de descanso: cuenta
      regresiva correcta, +15s/-15s, pausar/reanudar, saltar.
- [ ] Omitir un ejercicio completo (confirma diálogo, marca las series
      pendientes como omitidas).
- [ ] Finalizar la sesión (con confirmación si quedan series sin registrar) y
      volver a "Plan de hoy".
- [ ] Reabrir "Plan de hoy" con una sesión en curso muestra "Continuar
      entrenamiento" en vez de "Comenzar".

## Fase 4 — Historial, progreso y peso corporal
- [ ] El historial lista las sesiones pasadas con estado
      (completa/omitida/en curso) y la racha de días entrenados.
- [ ] El detalle de una sesión pasada muestra sus ejercicios y series
      registradas/omitidas.
- [ ] El progreso por ejercicio (desde el detalle de sesión) muestra el
      gráfico y la lista de registros históricos de ese ejercicio.
- [ ] Agregar un registro de peso corporal desde "Peso corporal".
- [ ] El gráfico y el "peso actual" de la pantalla de peso corporal reflejan
      el registro más reciente; los filtros semana/mes/todo funcionan.
- [ ] Eliminar un registro de peso corporal puntual (con confirmación).

## Fase 5 — Ajustes, tema y backup
- [ ] Cambiar el descanso por defecto en Ajustes y confirmar que un ejercicio
      nuevo agregado a un plan usa ese valor.
- [ ] Cambiar la unidad de peso (kg/lb) y confirmar que el historial
      existente (peso corporal, series de sesión, progreso por ejercicio) se
      **muestra convertido** sin alterar los datos guardados.
- [ ] Alternar tema claro/oscuro/sistema y confirmar que **toda la app**
      cambia (incluye header y tab bar de navegación, no solo el contenido).
- [ ] Activar/desactivar sonido y vibración del temporizador de descanso y
      confirmar el comportamiento en una sesión real.
- [ ] Exportar un backup (se abre el selector nativo "Guardar como") y
      confirmar que el archivo se genera.
- [ ] Importar un backup (el mismo u otro) y confirmar que fusiona sin
      duplicar planes/sesiones/registros ya existentes.
