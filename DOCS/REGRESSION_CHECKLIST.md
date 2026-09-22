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

**Fecha/hora manual al cargar peso corporal (issue #26)**
- [ ] Al abrir "Agregar registro" en "Peso corporal", el campo "Fecha y hora"
      muestra "ahora" por defecto (fecha/hora actual del dispositivo) y
      guardar sin tocarlo crea el registro con esa fecha/hora.
- [ ] Tocar el botón de "Fecha y hora" abre el selector nativo de fecha y,
      al confirmarla, encadena automáticamente el selector de hora (Android
      no soporta un picker combinado). Elegir una fecha/hora pasada y guardar
      crea el registro con esa fecha/hora exacta (visible en la lista y,
      si es más reciente que el resto, también como "Peso actual").
- [ ] El registro nuevo con fecha atrasada aparece ordenado correctamente en
      la lista y en el gráfico de evolución (no forzosamente al principio).

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

## Fase 6 — Superseries, ejercicios personalizados y notificaciones diarias
- [ ] En el editor de un día del plan, tocar "Superserie", seleccionar 2+
      ejercicios (no necesariamente contiguos) y confirmar: quedan agrupados
      y contiguos en una tarjeta con borde/badge "Superserie", con botones
      "Subir"/"Bajar"/"Desagrupar" a nivel de grupo.
- [ ] "Desagrupar" una superserie existente vuelve los ejercicios a tarjetas
      individuales sin alterar su orden relativo.
- [ ] Reordenar (drag & drop o subir/bajar) mueve un grupo de superserie como
      bloque completo, nunca partiéndolo.
- [ ] Duplicar un día/plan que tiene una superserie preserva el agrupamiento
      (con un id de grupo nuevo, no el mismo que el original).
- [ ] En una sesión con una superserie: registrar una serie de un ejercicio
      del grupo mientras el otro miembro todavía no completó esa misma serie
      **no** dispara el temporizador de descanso (pasa directo, sin
      navegar a la pantalla de Descanso); al completar esa serie en el
      último ejercicio pendiente del grupo (cerrando la "ronda"), sí se
      dispara el descanso normal.
- [ ] Las tarjetas de ejercicios agrupados en una superserie muestran el
      badge "Superserie" durante la sesión.
- [ ] Desde "Ejercicios", crear un ejercicio personalizado (nombre + foto +
      video elegidos desde la galería vía el selector nativo de Android) y
      confirmar que se guarda, aparece en el listado con su miniatura, y
      también aparece en el picker de ejercicios al armar un día de plan.
- [ ] Crear un ejercicio personalizado sin elegir foto/video (solo nombre)
      no rompe nada; el campo "Crear" queda deshabilitado si el nombre está
      vacío.
- [ ] En Ajustes → Notificaciones, activar "Recordatorio diario de
      entrenamiento": aparece el pedido de permiso de notificaciones (Android
      13+) y, al aceptarlo, se muestra el selector de hora (formato 24h).
- [ ] Cambiar la hora del recordatorio persiste el valor mostrado y
      reprograma el recordatorio (sin duplicarlo).
- [ ] Desactivar el switch cancela el recordatorio programado.

## Fase 7 — Pulido de UX y estabilidad post-v1

**Iconos del tab bar (issue #14)**
- [ ] Las 5 tabs (Plan de hoy, Mis planes, Ejercicios, Historial, Ajustes)
      muestran un ícono real; ninguna deja un recuadro vacío en su lugar.
- [ ] La tab activa muestra su ícono **relleno** y en color primario; las
      inactivas lo muestran **con contorno** y en gris. Al cambiar de tab, el
      relleno se mueve con la selección.
- [ ] En tema claro y en tema oscuro (Ajustes → Tema, o modo noche del
      emulador) los iconos siguen siendo legibles, tanto el activo como los
      inactivos.

**Swipe actions en listas (issue #15)**
- [ ] En "Mis planes", las tarjetas no muestran botones; al deslizar una hacia
      la izquierda aparecen **Activar** (solo si no es el plan activo),
      **Duplicar** y **Eliminar**. Tocar una acción la ejecuta y la tarjeta
      vuelve a cerrarse sola. Tocar el cuerpo de la tarjeta abre el plan.
- [ ] En el editor de un plan, cada día se desliza para **Duplicar** y
      **Eliminar**, y tocarlo abre el día.
- [ ] En el editor de un día, cada ejercicio se desliza para **Subir**,
      **Bajar**, **Editar** y **Eliminar**. El primero no ofrece "Subir" y el
      último no ofrece "Bajar".
- [ ] En ese mismo editor, **mantener presionada** una tarjeta y arrastrarla
      verticalmente sigue reordenando (el swipe horizontal y el arrastre
      vertical no se estorban).
- [ ] En una superserie, deslizar la **cabecera** ofrece Subir/Bajar (según su
      posición) y **Desagrupar**; deslizar cada ejercicio miembro ofrece
      **Editar** y **Eliminar**.
- [ ] En el modo de selección de superserie ("Superserie" → tocar ejercicios),
      el swipe queda desactivado y tocar una tarjeta la selecciona.
- [ ] En "Peso corporal", cada registro se desliza para **Eliminar** y la fila
      no muestra botón permanente.
- [ ] Con la tarjeta cerrada no se asoma ningún borde de color detrás de las
      esquinas redondeadas; en tema oscuro las acciones siguen legibles.
- [ ] Con un lector de pantalla (TalkBack), enfocar una tarjeta anuncia su
      nombre y ofrece las mismas acciones como acciones personalizadas.

**Nombre de ruta duplicado y aviso de Reanimated (issues #18, #20)**
- [ ] Al abrir la app en debug, el logcat no muestra el warning "Found
      screens with the same name nested inside one another".
- [ ] El flujo Plan de hoy → Comenzar entrenamiento → Finalizar entrenamiento
      vuelve a "Plan de hoy" sin errores de navegación.
- [ ] Al abrir un día con 2+ ejercicios no aparece el toast de LogBox por el
      aviso `[Reanimated] dependencies should only be used in web
      implementation` (sigue en `adb logcat`, pero no debe tapar la UI con el
      toast — spec 9.2 paso 6).

**Integridad al eliminar con historial de sesión ya registrado**
- [ ] Registrar (o solo omitir) al menos una serie de un ejercicio en una
      sesión, y luego eliminar ese ejercicio puntual desde el editor del día:
      no debe fallar (antes tiraba `FOREIGN KEY constraint failed`
      silencioso, ver detalle abajo). El historial de esa sesión sigue
      mostrando el ejercicio y sus series.
- [ ] Mismo caso pero eliminando el **día completo** (con ejercicios que ya
      tienen series de sesión): no debe fallar, y el historial sobrevive.
- [ ] Mismo caso pero eliminando el **plan completo**: no debe fallar, y el
      historial sobrevive (la sesión pasa a mostrar "Plan eliminado").

## Detalle de ejercicio con GIF (ExerciseDB)

**Con API key de ExerciseDB configurada (`src/config/apiKeys.ts`)**
- [ ] Tocar un ejercicio en la tab "Ejercicios" abre su detalle: imagen/GIF
      grande arriba, nombre, grupo muscular, equipo e instrucciones.
- [ ] La primera vez que se abre el detalle de un ejercicio con video
      disponible, el GIF tarda un instante en aparecer (se está descargando)
      y después queda animado. Revisar `adb logcat`/tráfico: solo se pide una
      vez por ejercicio.
- [ ] Cerrar y volver a abrir el mismo ejercicio (o reiniciar la app) muestra
      el GIF al instante, sin volver a pedirlo a la red (offline también).
- [ ] Desde "Mis planes" → un día → tocar un ejercicio para configurarlo,
      aparece el link "Ver detalle del ejercicio" arriba del formulario;
      tocarlo abre el mismo detalle y **no** pierde la configuración de
      series/reps si se vuelve atrás con el botón nativo.
- [ ] Desde la sesión de entrenamiento en curso, tocar la miniatura o el
      nombre de un ejercicio (no el botón "Omitir") abre su detalle.
- [ ] Un ejercicio del catálogo cuyo nombre no matcheó con ninguno de
      ExerciseDB (ej. un ejercicio poco común) muestra igual la miniatura
      estática, **sin** el aviso de "conéctate para ver el video" (no hay
      nada que descargar, no es un problema de conexión).
- [ ] Un ejercicio personalizado (creado a mano en "Ejercicios") abre su
      detalle mostrando su propia foto/video, sin intentar buscarlo en
      ExerciseDB.

**Sin API key configurada (`src/config/apiKeys.ts` vacío, estado por defecto
en un clon nuevo del repo)**
- [ ] La app arranca normal, sin errores en logcat por la falta de key.
- [ ] El detalle de cualquier ejercicio abre igual, mostrando la miniatura
      estática y el aviso "conéctate para ver el video la primera vez" nunca
      aparece (no hay `video_remote_url` para ningún ejercicio).
