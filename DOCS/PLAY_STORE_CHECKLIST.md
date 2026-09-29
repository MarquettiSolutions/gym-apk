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
- [ ] Pegar nombre, descripción corta y completa (desde el README, por idioma)
- [ ] Subir `icon-512.png`, `feature-graphic-1024x500.png`, los 4 `screenshot-*.png`
- [ ] Categoría: Salud y bienestar (o Deportes)
- [ ] Sitio web: `https://landing.nodylabs.com`
- [ ] Correo de contacto público

## 3. Política de privacidad
`App content → Privacy policy`
- [ ] Pegar `https://gymapk.nodylabs.com/privacy-policy`

## 4. Data safety
`App content → Data safety`
- [ ] Completar el formulario — todo queda local en el dispositivo, no hay
      servidor propio; revisar con cuidado igual (pedidos anónimos a
      `raw.githubusercontent.com` y `exercisedb.p.rapidapi.com`, sin datos
      personales)

## 5. Clasificación de contenido (IARC)
`App content → Content ratings`
- [ ] Completar el cuestionario (sin violencia/sexual/apuestas/sustancias,
      debería salir clasificación general baja)

## 6. Público objetivo
`App content → Target audience`
- [ ] Mayores de 13/18, no dirigida a niños
- [ ] Declaración de anuncios: la app no tiene anuncios

## 7. Declaración de app de salud
- [ ] Aclarar que no es un dispositivo médico ni da consejo médico — es una
      herramienta de organización de entrenamientos

## 8. Permiso sensible: Foreground Service
La app usa `FOREGROUND_SERVICE_SPECIAL_USE` (temporizador de descanso).
Texto de justificación sugerido:

> La app usa un servicio en primer plano para mantener activo el
> temporizador de descanso entre series durante una sesión de entrenamiento
> en curso, incluso si la pantalla se apaga o el usuario cambia de app
> momentáneamente. Sin esto, el temporizador se desincronizaría o se
> perdería, afectando la funcionalidad principal de la app (ejecutar una
> rutina de gimnasio con descansos cronometrados).

- [ ] Pegar la justificación si Play la pide
- [ ] Grabar un video corto mostrando el temporizador en background, si lo piden

## 9. Prueba interna
`Testing → Internal testing → Create new release`
- [ ] Subir `app-release.aab`
- [ ] Agregarte a vos mismo como tester
- [ ] Publicar, esperar el procesamiento
- [ ] Instalar desde el link de Play (no adb) y confirmar que anda bien

## 10. Prueba cerrada (12 testers x 14 días)
`Testing → Closed testing → Create track` (ej. "alpha")
- [ ] Subir el AAB (o promover el de internal testing)
- [ ] Generar el link de opt-in
- [ ] Compartirlo con 12 testers (Gmail)
- [ ] Anotar la fecha en que se completan los 12 — desde ahí corren los 14 días

**Fecha de inicio de la prueba cerrada:** _(completar cuando arranque)_

## 11. Producción
- [ ] Revisar el informe pre-lanzamiento (crashes, accesibilidad) y corregir
- [ ] Promover a producción con lanzamiento escalonado
- [ ] Monitorear Android vitals los primeros días

## Notas / bloqueos encontrados

_(agregar acá cualquier cosa rara que aparezca en el camino, para no
perder contexto entre sesiones)_
