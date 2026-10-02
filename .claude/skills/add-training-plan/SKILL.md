---
name: add-training-plan
description: Carga un plan de entrenamiento descrito en texto libre directo en la base de datos SQLite de gym-apk, en un dispositivo o emulador conectado por ADB, sin pasar por la UI. Usar cuando el dev (actualmente el único "cliente" de esta skill) describe un plan ("lunes push: press banca 4x8...") y quiere que quede cargado en la app sin tocar botones a mano.
---

# Cargar un plan de entrenamiento vía ADB + SQLite

Esta skill existe porque crear un plan tocando la UI a mano (como se hizo
para probar el fix de la issue #57) es lento y frágil: hay que esperar el
import del catálogo, lidiar con diálogos del sistema, calcular coordenadas de
tap, etc. Escribir directo en la base de datos del dispositivo es mucho más
rápido y confiable.

**Alcance actual**: solo sirve contra un build *debuggable* instalado en un
emulador o teléfono conectado por ADB (requiere `run-as`, que falla en builds
de release/Play Store). El "cliente" hoy es el propio dev trabajando en su
entorno de desarrollo — no un flujo para usuarios finales.

**Limitación v1**: solo crea un plan *nuevo* (con sus días y ejercicios). No
edita un plan existente. Si se necesita, pedirle al usuario que borre el
plan viejo desde la UI o extender `apply-plan.mjs`.

## Flujo

1. **Entender el plan que describe el usuario.** Convertilo vos (Claude) a
   un JSON con esta forma (ver `example-plan.json` en esta carpeta):

   ```json
   {
     "planName": "Push/Pull/Legs",
     "activate": true,
     "days": [
       {
         "weekday": 1,
         "label": "Push",
         "exercises": [
           { "name": "Barbell Bench Press", "sets": 4, "reps": 8, "weight": 60, "restSeconds": 90 },
           { "name": "Triceps Pushdown", "sets": 3, "reps": 12, "supersetGroup": "A" },
           { "name": "Lateral Raise", "sets": 3, "reps": 15, "supersetGroup": "A" }
         ]
       }
     ]
   }
   ```

   - `weekday`: 0=domingo, 1=lunes, ..., 6=sábado (igual que
     `Date.prototype.getDay()` — así está guardado en la DB, ver
     `src/db/schema/planDays.ts`).
   - `exercises[].name`: el nombre tal como lo dice el usuario (español,
     portugués o inglés). El script lo resuelve contra
     `src/shared/i18n/exerciseNames.ts` (diccionario es/pt → inglés) y contra
     `exercises.name` en la propia DB. **No necesitás vos resolver el id del
     ejercicio** — eso lo hace el script.
   - `restSeconds` default 30 si se omite; `weight`/`notes` opcionales.
   - `supersetGroup`: mismo string en dos o más ejercicios del mismo día =
     quedan agrupados como súper serie (ver conversación sobre qué es una
     súper serie si hace falta explicarlo de nuevo).
   - `activate` default `true` (desactiva cualquier otro plan activo del
     usuario, igual que `plansRepository.setActive`).

   Escribí este JSON a un archivo temporal, p. ej. en el scratchpad de la
   sesión, no en el repo.

2. **Confirmá el dispositivo.** Si hay más de un dispositivo/emulador en
   `adb devices`, vas a necesitar `--serial <id>`.

3. **Corré el script:**

   ```bash
   node .claude/skills/add-training-plan/apply-plan.mjs /ruta/al/plan.json
   ```

   Qué hace by debajo (no hace falta que lo repitas a mano, pero es bueno
   saber qué toca):
   - `adb shell am force-stop com.nodylabs.gymapk` (evita leer la DB a mitad
     de una escritura / con WAL pendiente).
   - Trae `databases/gymapk.db` del dispositivo vía
     `run-as com.nodylabs.gymapk cat ...` a un directorio temporal, y guarda
     un backup ahí mismo antes de tocar nada.
   - Resuelve cada nombre de ejercicio contra la DB + el diccionario de
     traducciones. Si algún nombre es ambiguo o no matchea nada, el script
     **no escribe nada** y te devuelve un JSON con `status: "unresolved_exercises"`
     y los candidatos — a ver con el usuario, corregir el nombre en el
     `plan.json` (o poner `"exerciseId"` directo en vez de `"name"`) y volver a
     correr.
   - Si todo resuelve, genera el `INSERT` de `plans` + un `INSERT` por cada
     `plan_days` y `plan_day_exercises`, todo en una transacción
     (`BEGIN`/`COMMIT`, con `-bail` para que un error aborte sin dejar nada a
     medias).
   - Empuja la DB modificada de vuelta con `adb push` + `run-as ... cat >`, y
     reabre la app (`am start`).

4. **Reportale al usuario** el resumen que imprime el script al final
   (`status: "ok"`, `planId`, días creados) y, si quiere verificar, decile
   que abra la app — ya debería mostrar el plan sin más pasos.

## Cuándo NO usar esta skill

- Build de release / APK firmado para Play Store: `run-as` va a fallar
  (`run-as: Package '...' is not debuggable`). En ese caso, el único camino
  es la UI normal.
- Si el usuario pide explícitamente "hacelo por la UI" (por ejemplo para
  volver a probar un fix de UI como el de #57).
- Si hay cambios de schema de DB pendientes sin mergear en la rama actual:
  la skill asume el schema de `main` (ver `src/db/schema/*.ts`); si estás en
  una rama con una migración nueva sin aplicar al dispositivo, el INSERT
  puede fallar o quedar con columnas de menos.

## Troubleshooting

- **`no se pudo leer la DB vía run-as`**: o el build no es debuggable, o el
  paquete no está instalado, o el dispositivo elegido no es el correcto.
- **`no hay fila en users`**: abrí la app al menos una vez en ese dispositivo
  antes de correr la skill (la fila de usuario local se crea en el primer
  `initDatabase()`).
- **Ejercicios no resueltos**: normal si el usuario usa un nombre muy
  distinto al catálogo (p. ej. "press plano" en vez de "press de banca"). Los
  `candidates` que devuelve el script ya traen nombre + id — elegí el que
  corresponda y poné `"exerciseId"` en el JSON en vez de `"name"` para ese
  ejercicio puntual, sin tener que adivinar mejor el texto.
