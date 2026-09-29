# Assets para la ficha de tienda (Play Store)

Ver issue #38, Bloque 4. Todo lo de acá es para pegar/subir en Play Console
cuando se cree la ficha de la app — no se usa en el build de la app.

## Archivos

- `icon-512.png` — ícono 512x512 para la ficha de tienda, renderizado desde
  `../ic_launcher-source.svg` (el mismo vector que usan los mipmaps del
  launcher). Para regenerarlo tras cambiar el SVG:
  `rsvg-convert -w 512 -h 512 ../ic_launcher-source.svg -o icon-512.png`
- `feature-graphic-source.svg` / `feature-graphic-1024x500.png` — gráfico de
  funciones (1024x500) para la ficha de tienda. Regenerar con
  `rsvg-convert -w 1024 -h 500 feature-graphic-source.svg -o feature-graphic-1024x500.png`
- `screenshot-*.png` — 4 capturas reales tomadas en el emulador (AVD
  `Medium_Phone`, locale en-US) con datos de ejemplo: catálogo de
  ejercicios, plan del día activo, editor de un día del plan con 2
  ejercicios, y sesión de entrenamiento en curso. Cumple el mínimo de Play
  (2, recomendado 4-8). Pendiente: versiones en es-419/pt-BR si se quiere
  una ficha localizada (hoy están en inglés porque el emulador estaba en
  ese idioma).

  **Proporción 9:16**: el emulador captura en 1080x2400 (20:9), fuera del
  rango 16:9–9:16 que exige el uploader de Play Console para capturas de
  teléfono. Se corrigió agregando pillarbox blanco a los costados (queda
  invisible porque el fondo de la app es blanco) hasta 1350x2400 = 9:16
  exacto, sin recortar ningún contenido. Regenerar así tras sacar capturas
  nuevas del emulador:
  `magick captura-original.png -gravity center -background white -extent 1350x2400 screenshot-N-nombre.png`

## Textos de la ficha (nombre, descripciones)

**Nombre de la app** (máx. 30 caracteres): `Gym Apk`

**Descripción corta** (máx. 80 caracteres):
- ES: Arma tu rutina de gym, controla series y peso. 100% offline, sin cuenta.
- EN: Build your gym routine, track sets and weight. 100% offline, no account.
- PT: Monte seu treino, registre séries e peso. 100% offline, sem conta.

**Descripción completa** (máx. 4000 caracteres) — ES:

```
Gym Apk es una app 100% offline para armar y ejecutar tus rutinas de entrenamiento de gimnasio, sin cuenta de usuario ni costo.

PLAN SEMANAL
Armá tu rutina eligiendo los días de entrenamiento y, para cada día, los ejercicios desde un catálogo con más de 1000 opciones, buscador y filtro por grupo muscular o equipo. Definí series, repeticiones, peso objetivo y descanso por ejercicio. El plan se repite automáticamente cada semana.

SESIÓN GUIADA
Cada ejercicio muestra una imagen y un video corto de cómo ejecutarlo. Marcá cada serie como completada, registrá el peso y las repeticiones reales (la app te sugiere el último valor cargado), y un temporizador de descanso configurable arranca solo al terminar cada serie. Soporta superseries/circuitos.

HISTORIAL Y PROGRESO
Consultá tus sesiones pasadas y un gráfico de evolución de peso/repeticiones por ejercicio, para ver tu progreso real a lo largo del tiempo.

PESO CORPORAL
Registrá tu peso corporal cuando quieras y seguí su evolución en un gráfico, con filtro por rango de fechas.

EJERCICIOS PERSONALIZADOS
¿Falta un ejercicio en el catálogo? Creá el tuyo con nombre y una foto o video propio desde tu galería.

100% OFFLINE Y PRIVADO
No hace falta conexión para usar la app día a día: el catálogo y los videos que uses quedan guardados en tu teléfono. No pedimos cuenta, no usamos analíticas ni publicidad, y tus datos nunca salen de tu dispositivo (podés exportar un backup manual cuando quieras).

Ideal si buscás una alternativa gratuita a apps de seguimiento de gimnasio de pago.

Más info: https://landing.nodylabs.com
```

— EN:

```
Gym Apk is a 100% offline app to build and run your gym workout routines, no account and no cost.

WEEKLY PLAN
Build your routine by choosing your training days and, for each day, exercises from a catalog of 1000+ options, with search and filters by muscle group or equipment. Set sets, reps, target weight and rest time per exercise. The plan repeats automatically every week.

GUIDED SESSION
Every exercise shows a picture and a short demo video of how to perform it. Check off each set as you complete it, log the actual weight and reps (the app suggests the last value you logged), and a configurable rest timer starts automatically once you finish a set. Supersets/circuits supported.

HISTORY AND PROGRESS
Browse past sessions and a weight/reps progress chart per exercise, to see your real progress over time.

BODY WEIGHT
Log your body weight whenever you want and track its trend on a chart, with a date range filter.

CUSTOM EXERCISES
Missing an exercise from the catalog? Create your own with a name and a photo or video from your own gallery.

100% OFFLINE AND PRIVATE
No connection needed for day-to-day use: the catalog and any videos you open are stored on your phone. No account required, no analytics, no ads, and your data never leaves your device (you can export a manual backup whenever you want).

A great free alternative to paid gym-tracking apps.

More info: https://landing.nodylabs.com
```

— PT:

```
Gym Apk é um aplicativo 100% offline para montar e executar suas rotinas de treino de academia, sem conta e sem custo.

PLANO SEMANAL
Monte sua rotina escolhendo os dias de treino e, para cada dia, os exercícios de um catálogo com mais de 1000 opções, com busca e filtro por grupo muscular ou equipamento. Defina séries, repetições, peso alvo e descanso por exercício. O plano se repete automaticamente toda semana.

SESSÃO GUIADA
Cada exercício mostra uma imagem e um vídeo curto de como executá-lo. Marque cada série como concluída, registre o peso e as repetições reais (o app sugere o último valor registrado), e um cronômetro de descanso configurável começa sozinho ao terminar cada série. Suporta superséries/circuitos.

HISTÓRICO E PROGRESSO
Veja suas sessões anteriores e um gráfico de evolução de peso/repetições por exercício, para acompanhar seu progresso real ao longo do tempo.

PESO CORPORAL
Registre seu peso corporal quando quiser e acompanhe sua evolução em um gráfico, com filtro por período.

EXERCÍCIOS PERSONALIZADOS
Falta algum exercício no catálogo? Crie o seu, com nome e uma foto ou vídeo da sua própria galeria.

100% OFFLINE E PRIVADO
Não precisa de conexão para o uso do dia a dia: o catálogo e os vídeos que você abrir ficam salvos no celular. Não pedimos conta, não usamos análise de comportamento nem anúncios, e seus dados nunca saem do seu dispositivo (você pode exportar um backup manual quando quiser).

Uma ótima alternativa gratuita a apps pagos de acompanhamento de treino.

Mais informações: https://landing.nodylabs.com
```

## Sitio web

`https://landing.nodylabs.com` — usar este link tanto en el campo dedicado
"Sitio web" de la ficha de tienda como en el cierre de la descripción larga
(ya incluido arriba en los 3 idiomas).

## Política de privacidad

URL: https://gymapk.nodylabs.com/privacy-policy — código fuente en
`docs/privacy-policy/privacy-policy/index.html`, hosteada en Cloudflare Pages
junto con la landing de documentación en `docs/privacy-policy/index.html`
(detalles de despliegue en el comentario correspondiente de la issue #38).
