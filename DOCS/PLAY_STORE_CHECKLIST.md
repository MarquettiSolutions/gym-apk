# Checklist de publicación en Google Play

Complementa la issue #38. Guía paso a paso para crear la ficha de la app en
Play Console y llegar a producción, una vez terminado todo el trabajo de
código (firma de release, assets, textos, política de privacidad — ver
`android/app/store-assets/README.md`).

## Ya listo (no repetir)

- [x] AAB firmado con keystore propio (Bloque 1, PR #42). Regenerar antes de
      subir por si hay cambios nuevos: `cd android && ./gradlew bundleRelease`
      → `android/app/build/outputs/bundle/release/app-release.aab`
- [x] Ícono, feature graphic, 4 capturas de pantalla: `android/app/store-assets/`
- [x] Textos de nombre/descripciones (ES/EN/PT) + sitio web:
      `android/app/store-assets/README.md`
- [x] Política de privacidad publicada: https://gymapk.nodylabs.com/privacy-policy
- [x] Decisión sobre la API key de ExerciseDB (Bloque 2, ver comentario en
      la issue #38): aceptar el riesgo, key embebida tal cual
- [x] Cuenta de Google Play Developer aprobada (cuenta **personal** — implica
      el requisito de 12 testers x 14 días de prueba cerrada antes de
      producción)

## 1. Crear la app
- [x] Play Console → **Crear app** (hecho 2026-09-29)
- [x] Nombre: `Gym Apk`
- [x] Idioma predeterminado: español
- [x] Tipo: **App** (no juego), gratis
- [x] Aceptar declaraciones de developer program policies y US export laws

## 2. Ficha principal de la tienda
`Grow → Store presence → Main store listing`
- [x] Nombre, descripción corta y completa (español) — pegadas 2026-09-30
- [x] `icon-512.png`, `feature-graphic-1024x500.png`, los 4 `screenshot-*.png`
      subidos (capturas re-exportadas a proporción 9:16 antes de subir, ver
      `android/app/store-assets/README.md`)
- [x] Categoría: Saúde e fitness
- [x] Sitio web: `https://landing.nodylabs.com`
- [x] Correo de contacto: wasosky313@gmail.com
- Página completa, estado "Pronta para revisão"

## 3. Política de privacidad
`App content → Privacy policy`
- [x] `https://gymapk.nodylabs.com/privacy-policy/` — ya cargada, verificada

## 4. Data safety
`App content → Data safety`
- [x] Verificado: "Não" a recolección de datos obligatorios — ya estaba
      correcto tal como lo había cargado el usuario

## 5. Clasificación de contenido (IARC)
`App content → Content ratings`
- [x] Verificado: cuestionario ya completado, clasificación "Livre"/"E"
      (todo público), sin descriptores de contenido — correcto para esta app

## 6. Público objetivo
`App content → Target audience`
- [x] Corregido: estaba limitado a solo mayores de 18 → ampliado a 13, 16-17
      y 18+ (decisión del usuario, la app no tiene contenido inapropiado
      para adolescentes)
- [x] Declaración de anuncios: "Não, meu app não tem anúncios" — correcto

## 7. Declaración de app de salud
`App content → Apps de saúde`
- [x] Corregido: tenía marcado "Atividade e condicionamento físicos" pero
      faltaba "Controle de nutrição e peso" (la app trackea peso corporal)
      → agregado. Sin requisitos regionales de dispositivo médico.

## 8. Permiso sensible: Foreground Service
- [x] **Resuelto sacando el permiso, no justificándolo** (PR #51): Play pidió
      justificar `FOREGROUND_SERVICE_SPECIAL_USE`, pero el temporizador de
      descanso nunca usó un foreground service real — funciona con
      `notifee`'s `TimestampTrigger`. El permiso estaba de más desde la Fase
      0 (para un plan que se implementó distinto). Se sacó del manifest en
      vez de declararle a Google un servicio inexistente.
- Si en el futuro se implementa un foreground service real, ver issue #52.

Otras declaraciones ya revisadas y correctas sin cambios: Detalhes do login
(No), Anúncios (No), Apps governamentais (No), Recursos financeiros (No
oferece), ID de publicidade (No).

## 9. Prueba interna
`Testing → Internal testing → Create new release`
- [x] AAB regenerado con las **4 arquitecturas** (ojo: un build anterior se
      hizo por error solo con `-PreactNativeArchitectures=x86_64`, que solo
      sirve para emulador — no usar ese para subir a Play)
- [x] Lista de testers cargada — formato correcto: **un email por línea, sin
      cabezal** (un primer intento con emails separados por comas en una
      sola línea dio error "líneas inválidas" en Play Console)
- [x] Subido y publicado 2026-09-30 14:12 — versión 0.0.1 (versionCode 1),
      "Disponível para testadores internos"
- [x] `versionCode` subido a 2 (PR #53) para poder resubir con el fix del
      permiso de foreground service — **falta subir ese AAB nuevo** a Play
      Console (`android/app/build/outputs/bundle/release/app-release.aab`,
      ya compilado localmente al cierre de esta sesión)
- [ ] Instalar desde el link de Play (no adb) y confirmar que anda bien

## 10. Prueba cerrada (12 testers x 14 días)
`Testing → Closed testing → Create track` (ej. "alpha")
- [x] Lista de 13 testers lista (familia/amigos + njdesignprint) — **guardada
      solo local**, no versionada en el repo público (son emails reales de
      terceros; se probó un gist "secreto" de GitHub y se borró a pedido del
      usuario, que prefiere decidir después dónde guardarla)
- [ ] Subir el AAB (o promover el de internal testing) a un track de prueba cerrada
- [ ] Generar el link de opt-in
- [ ] Compartirlo con los 13 testers
- [ ] Anotar la fecha en que se completan los 12 — desde ahí corren los 14 días

**Fecha de inicio de la prueba cerrada:** _(completar cuando arranque)_

## 11. Producción
- [ ] Revisar el informe pre-lanzamiento (crashes, accesibilidad) y corregir
- [ ] Promover a producción con lanzamiento escalonado
- [ ] Monitorear Android vitals los primeros días

## Notas / bloqueos encontrados

- Issue #52: evaluar a futuro un foreground service real para la sesión de
  entrenamiento (no urgente, el timer actual con `notifee` funciona bien).
- Issue #54: el primer arranque (DB vacía) bloquea toda la UI en pantalla
  "Loading..." mientras se importa el catálogo completo + miniaturas
  (~50s en el emulador) — `initDatabase()` en `src/db/client.ts` espera
  `importExerciseCatalogIfNeeded`/`backfillExerciseVideoUrlsIfNeeded` antes
  de dejar pasar. No bloquea publicar, pero es mala primera impresión.
- La subida de imágenes (ícono/feature graphic/capturas) en Play Console usa
  el selector de archivos nativo del SO, no un `<input type=file>` — no se
  puede automatizar por browser, lo tiene que hacer el usuario a mano. La
  subida del AAB sí tiene un input real, pero el límite de la herramienta de
  automatización es 10 MB (el AAB pesa ~66 MB) — tampoco se puede subir por
  ahí, el usuario lo sube manualmente.
