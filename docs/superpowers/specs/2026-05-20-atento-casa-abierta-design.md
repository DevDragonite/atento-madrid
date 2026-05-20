# Atento — "La casa abierta" (modo scroll horizontal cinematográfico)

**Fecha:** 2026-05-20
**Estado:** Diseño aprobado, pendiente plan de implementación
**Reemplaza:** El plano top-down actual (`InteractiveExperience2D.tsx`) queda obsoleto

---

## 1. Contexto

Atento es un restaurante clandestino en Madrid llevado por Antonio (chef) y Mila (arquitecta), hermanos venezolanos. La web es una herramienta VIP privada — no pública. El cliente entra con código de invitación, explora "el mundo" de Atento, llena un formulario extendido, y a Antonio le llega una notificación con la cotización oculta.

Hoy la exploración es un plano top-down 2D con 7 hotspots pulsantes. Este spec define un reemplazo: un paseo cinematográfico horizontal por la casa, inspirado en la mecánica de ICG Gallery (`icggallery.irisceramicagroup.com`) — scroll vertical mapeado a pan horizontal por escenas conectadas.

El nuevo modo también funciona como **caso-demo replicable** para vender web inmersiva a restaurantes de Caracas.

## 2. Concepto

Un paseo durante la **hora azul** por la casa de Antonio y Mila. Después del gate de invitación, el invitado ve su nombre aparecer como un susurro y de ahí recorre horizontalmente tres bloques de la casa: cocina, mesa, casa. Termina en la mesa servida, donde una carta de papel sube desde abajo con el formulario de reserva integrado.

El contraste **noche azul afuera / luz cálida adentro** es la metáfora visual del producto: el mundo público vs el mundo privado al que te invitaron.

## 3. Decisiones de diseño (resumen del brainstorm)

| Decisión | Elegido |
|---|---|
| Relación con plano top-down | **Reemplaza** |
| Medio de imágenes | **IA generativa** (Flux 1.1 Pro o Midjourney v7) |
| Estructura visual | **Híbrido: 3 clusters continuos** con transiciones entre ellos |
| Mecánica de scroll | **Scroll vertical mapeado a horizontal** (scroll-jack tipo ICG) |
| Personajes en escena | **Mixto** — manos de Antonio (bloque 1), casa vacía (bloque 2), Antonio y Mila al fondo (bloque 3) |
| Mood / hora del día | **Hora azul** (exterior azul medianoche + interior cálido dorado) |
| Apertura | Nombre del invitado en serif itálica → fade a cocina |
| Cierre | La carta sube desde abajo con el formulario integrado |

## 4. Arquitectura del recorrido

### 4.1 Apertura — "El nombre" (~3 s)
- Pantalla negra con partículas tenues.
- El nombre del invitado (proveniente del código de invitación validado server-side) aparece en serif itálica grande, centrado, en color crema.
- Fade a un cielo azul medianoche que se acerca y revela la primera ventana cálida.
- Crossfade a la cocina.

### 4.2 Bloque 1 — "Cocina" (~3 500 px continuos)
- **Contenido:** cocina al fuego visto desde un ángulo cinematográfico bajo. Manos de Antonio cortando o moviendo una sartén (cara no protagonista). Vapor del caldo. Encimera de madera. Luz dorada del extractor.
- **Continúa hacia:** plato ya emplatado en la encimera, listo para salir.
- **Hotspots:**
  - 🔹 Cuchillo en la tabla → abre overlay *La cocina*
  - 🔹 Plato emplatado → abre overlay *El plato*

### 4.3 Transición de cine (~600 ms)
- Blur sweep diagonal o cortina suave entre bloques.
- Sirve para ocultar el corte entre dos panorámicas independientes y dar ritmo cinematográfico.

### 4.4 Bloque 2 — "Mesa" (~5 000 px continuos)
- **Contenido:** comedor vacío pero recién dispuesto. Mantel blanco, velas encendidas, flores frescas, ventana al fondo con el azul de la hora azul.
- **Continúa hacia:** una bodega o aparador con copas servidas en bandeja, botellas iluminadas.
- **Continúa hacia:** detalle del ritual — silla ligeramente retirada como si alguien acabara de sentarse, servilleta a medio doblar, una copa con marca de labios sutil.
- **Hotspots:**
  - 🔹 Vela encendida → overlay *La mesa*
  - 🔹 Copa servida → overlay *El alma*
  - 🔹 Silla retirada / servilleta → overlay *El ritual*

### 4.5 Transición de cine (~600 ms)

### 4.6 Bloque 3 — "Casa" (~3 500 px continuos)
- **Contenido:** sala/pasillo con galería de marcos colgados — fotos reales de noches pasadas en Atento.
- **Continúa hacia:** vista amplia del comedor desde el umbral, con Antonio y Mila al fondo en gesto de despedida/abrazo (toma amplia, caras no protagonistas).
- **Continúa hacia:** retorno a la mesa, ahora servida solo para el invitado.
- **Hotspots:**
  - 🔹 Marco con foto → overlay *La memoria* (galería)

### 4.7 Cierre — "La carta"
- Al alcanzar el final del scroll horizontal, la cámara se ancla en la mesa servida.
- Una carta de papel sube desde la base de la pantalla con animación suave (~800 ms).
- La carta contiene el **formulario de reserva extendido**: fecha (calendario de fechas habilitadas), nº personas, alergias, preferencias de comida, preferencias de vino/maridaje.
- Al enviar: la carta se sella con un gesto sutil y aparece el mensaje en español venezolano "Antonio y Mila les escribirán pronto".

## 5. Estética y dirección de arte

### 5.1 Paleta
- **Exterior (cielo, ventanas):** azul medianoche `#0e1a2e` → azul profundo `#1a2845`
- **Interior cálido:**
  - Ámbar `#d4a574`
  - Terracota `#c97b5c`
  - Miel `#c9a96e`
  - Crema `#f0e8da`
  - Vino para acentos `#8b1928`

### 5.2 Luz
- Puntual cálida desde lámparas colgantes, velas, llama del fogón.
- Contraste fuerte entre el azul frío exterior y el dorado interior.
- Sombras largas, dramáticas, claroscuro suave.

### 5.3 Tipografía
- **Nombre del invitado y labels de hotspot:** serif itálica de la marca actual, tamaño grande para el nombre.
- **Copy de overlays:** sans cálida actual.
- **Formulario:** consistencia con tipografía actual.

### 5.4 Idioma
- **Español venezolano**: ustedes / les / su (no vosotros / os / vuestro).
- Tono cálido pero elegante. Cero coloquialismos fuertes.

## 6. Hotspots

Componente reutilizado conceptualmente del modo 2D actual, pero re-diseñado visualmente:

- **Forma:** círculo pequeño (~32 px) con icono SVG del objeto referido (cuchillo, plato, vela, copa, etc.) en color crema con halo dorado pulsante.
- **Interacción:** hover muestra label en tipografía serif sobre fondo translúcido oscuro. Click abre el overlay fullscreen actual (foto real + texto + efecto Ken Burns).
- **Posición:** `<div>` absoluto sobre cada panorámica con coordenadas en porcentaje del bloque.
- **Overlay reutilizado:** el componente `HotspotDetail` actual con su Ken Burns image y su copy se mantiene sin cambios.

## 7. Implementación técnica

### 7.1 Stack
- Next.js + React existentes.
- **Smooth scroll:** [Lenis](https://github.com/darkroomengineering/lenis).
- **Scroll-driven animation:** Framer Motion `useScroll` + `useTransform`, o GSAP `ScrollTrigger` si Lenis+Framer no se llevan bien.

### 7.2 Mecánica del scroll horizontal
- Wrapper `<section>` con `height: 100vh` (sticky) que contiene un `<div>` interno horizontal con los 3 bloques + transiciones.
- `scrollY` del documento se mapea a `translateX(-scrollY * factor)` del contenedor horizontal.
- Largo total del scroll vertical = suma de los bloques (~12 000 px) + apertura (~1 000 px) + cierre (~1 000 px) ≈ 14 000 px.

### 7.3 Imágenes
- 8-10 imágenes panorámicas WebP en `/public/casa-abierta/`.
- Resolución: ~3 000-5 000 px de ancho × 1 080 px de alto.
- Compresión agresiva (WebP quality 75-80). Tamaño total objetivo: 30-60 MB.
- Lazy loading por bloque (`loading="lazy"` + `<picture>` con preload del bloque siguiente).

### 7.4 Hotspots
- `<div>` absolutos sobre cada bloque, coordenadas en porcentaje del ancho del bloque.
- Pulsación con `framer-motion` `animate` infinito.
- Click dispara overlay existente.

### 7.5 Móvil
- **Sin scroll-jack en móvil.**
- Bloques se presentan como **slides en `scroll-snap-type: x mandatory`** con swipe horizontal nativo.
- Cada bloque ocupa una pantalla completa.
- Transiciones de cine se simplifican a fade.
- El formulario final aparece como overlay fullscreen (no como carta que sube).
- Indicador de progreso abajo (dots).

### 7.6 Apertura
- Componente nuevo `IntroName.tsx`: pantalla negra → partículas (canvas o SVG ligero) → nombre del invitado (proveniente del context del gate) → crossfade.
- Se monta solo en la primera visita de la sesión (controlado por `sessionStorage`).

### 7.7 Cierre con carta
- Componente nuevo `LetterForm.tsx`: papel con `box-shadow` y rotación sutil sube desde `translateY(100%)` a `translateY(0%)` con `spring`.
- Contiene el formulario actual con estilos adaptados al papel.
- Al enviar exitoso: la carta se "sella" (animación de cera roja apareciendo) y mensaje de confirmación.

## 8. Componentes que se reutilizan vs nuevos

### Reutilizados (sin cambios)
- Gate de invitación (`src/lib/invitations.ts`, ruta `/api/invite`).
- Overlay de hotspot (`HotspotDetail` con foto + texto + Ken Burns).
- Propuestas de menú dentro de "El plato".
- Motor de cotización oculta.
- Notificación a Antonio vía Telegram (reusar `send_telegram_updates.py` de Boveda/scripts).

### Nuevos
- `CasaAbiertaExperience.tsx` — wrapper con scroll-jack y orquestación de bloques.
- `Bloque.tsx` — componente de bloque panorámico con imagen + hotspots.
- `IntroName.tsx` — intro del nombre del invitado.
- `LetterForm.tsx` — formulario en forma de carta.
- `Transition.tsx` — transición de cine entre bloques.
- 8-10 imágenes IA en `/public/casa-abierta/`.
- Versión móvil con `scroll-snap` (puede vivir en el mismo componente con media queries).

### Eliminado
- `InteractiveExperience2D.tsx` (plano top-down). El archivo se borra una vez la nueva experiencia esté validada por Antonio.
- `InteractiveExperience.tsx` (versión 3D vieja) y `InteractiveExperienceLazy.tsx` si aún cuelgan sin uso.

## 9. Pipeline de generación de imágenes (IA)

### 9.1 Herramientas
- **Modelo principal:** Flux 1.1 Pro (vía fal.ai) o Midjourney v7.
- **Outpainting:** Flux Fill o Photoshop Generative Fill para extender lateralmente.
- **Referencia humana:** img2img con foto real de Antonio y Mila (pedirla en la próxima conversación).

### 9.2 Prompt base
```
blue hour outside warm Spanish home interior at dinner time,
[scene-specific subject],
cinematic horizontal panorama, anamorphic 21:9,
golden lamp light spilling onto wood and terracotta,
candles, vapor, intimate unstaged composition,
film grain, shallow depth of field, hour-blue sky through windows,
warm amber and cream interior, deep navy exterior,
no people in foreground (or: hands only / silhouettes / wide shot)
```

### 9.3 Plan de escenas
| # | Bloque | Prompt subject | Personas |
|---|---|---|---|
| 1 | Cocina | hands chopping vegetables on wooden board, low angle, steaming pot, copper pan | Manos de Antonio |
| 2 | Cocina | plated dish on warm wooden counter, garnish, finishing touches | Solo plato |
| 3 | Mesa | set dining table with white linen, lit candles, flowers, blue dusk window | Vacío |
| 4 | Mesa | sideboard with poured wine glasses, backlit bottles, intimate light | Vacío |
| 5 | Mesa | ritual moment, slightly pulled-back chair, folded napkin, lipstick-marked glass | Vacío |
| 6 | Casa | hallway with framed photos of past dinners on warm wall | Vacío |
| 7 | Casa | wide shot of dining room from doorway, hosts in background hugging guest | Antonio + Mila de fondo |
| 8 | Casa | return to served table, alone, candles burning, anticipation | Vacío |

### 9.4 Iteración
- 1-2 días de generación + retoque.
- Antonio aprueba escena por escena antes de pasar a la siguiente.
- Coherencia espacial entre bloques: misma paleta, mismo tipo de luz, mismas texturas de madera y terracota repetidas.

## 10. Replicabilidad (showcase Caracas)

Cada restaurante nuevo necesita:
- 8-10 imágenes IA re-prompteadas para su espacio real.
- Foto de los dueños como reference (si aparecen).
- Copy adaptado a su voz (sigue siendo español neutro o de la región).
- Configuración: cambiar `INVITATION_CODES`, hotspots, calendario de fechas, motor de cotización.

**Cero código nuevo.** El sistema se empaca como producto: *"Web cinematográfica VIP para restaurantes privados"*.

Riesgo a vigilar: la dependencia visual de la IA — si los modelos cambian o se degradan, las imágenes se vuelven irrepetibles. Mitigación: guardar prompts + seeds + PSDs/sources de cada cliente.

## 11. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Scroll-jack se siente "secuestrado" / lento | Media | Lenis bien tuneado, factor de scroll cuidadoso, escape-hatch con tecla Esc para saltar |
| Imágenes IA no convencen a Antonio | Media | Iterar por escena con feedback, opción híbrida con foto real de la cocina |
| Móvil pierde la magia con `scroll-snap` | Media | Aceptado — el VIP usa link desde escritorio cuando puede; en móvil prioridad es funcional |
| Caras de Antonio/Mila en bloque 3 inconsistentes | Alta | Usarlos solo en toma amplia con caras parcialmente fuera de cuadro o desenfocadas |
| Tamaño de imágenes hace lento el primer paint | Media | Preload solo del bloque 1, lazy del resto, WebP con compresión agresiva |

## 12. Métricas de éxito

- Antonio aprueba el prototipo en una sola revisión (sin volver al plano top-down).
- El primer cliente VIP completa la reserva sin abandono.
- La presentación a un restaurante de Caracas se cierra como caso de éxito con este prototipo.
- Tamaño total del sitio < 70 MB.
- Tiempo a primer paint significativo < 2 s en conexión 4G.

## 13. Fuera de alcance (de este spec)

- Audio ambiente / música.
- Modo 3D real-time (Three.js / WebGL).
- Multiidioma (sigue solo en español venezolano).
- Edición visual por Antonio en vivo (admin dashboard).
- Sistema de pagos / depósito de reserva.
- Variantes estacionales del recorrido.

Estos quedan para iteraciones futuras si la prueba con Antonio resulta exitosa.
