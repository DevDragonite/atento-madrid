# Atento "La casa abierta" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el plano top-down 2D actual por una experiencia de scroll horizontal cinematográfico ("La casa abierta") basada en imágenes IA, hotspots integrados y formulario de reserva en forma de carta.

**Architecture:** Wrapper `CasaAbiertaExperience` que orquesta una intro con el nombre del invitado, tres bloques panorámicos conectados por transiciones, y un cierre con `LetterForm`. El scroll vertical se mapea a `translateX` con Lenis + Framer Motion. Las imágenes son panorámicas WebP generadas por IA en `/public/casa-abierta/`. Hotspots son `<div>` absolutos con coordenadas en porcentaje sobre cada bloque.

**Tech Stack:**
- Next.js 16, React 19, TypeScript
- `framer-motion` 12 (animaciones + `useScroll`/`useTransform`)
- `lenis` 1.3 (smooth scroll — ya instalado)
- `node --test` para los pocos tests de lógica pura (sin nuevas deps)

**Spec asociado:** [`docs/superpowers/specs/2026-05-20-atento-casa-abierta-design.md`](../specs/2026-05-20-atento-casa-abierta-design.md)

---

## File Structure

### Nuevos archivos

| Archivo | Responsabilidad |
|---|---|
| `src/components/casa-abierta/CasaAbiertaExperience.tsx` | Wrapper con scroll-jack y orquestación de fases (intro → bloques → carta) |
| `src/components/casa-abierta/Bloque.tsx` | Panorámica horizontal individual con sus hotspots |
| `src/components/casa-abierta/IntroName.tsx` | Intro de ~3s con nombre del invitado |
| `src/components/casa-abierta/Transition.tsx` | Cortina/blur entre bloques |
| `src/components/casa-abierta/HotspotMarker.tsx` | Círculo con icono + pulso sobre la panorámica |
| `src/components/casa-abierta/LetterForm.tsx` | Carta animada que envuelve `ReservationFlow` |
| `src/components/casa-abierta/HotspotDetail.tsx` | Overlay fullscreen extraído desde `InteractiveExperience2D.tsx` |
| `src/components/casa-abierta/MobileExperience.tsx` | Variante móvil con `scroll-snap` horizontal |
| `src/lib/casa-abierta/scenes.ts` | Config de los 3 bloques + 8 escenas |
| `src/lib/casa-abierta/hotspots.ts` | Config de los hotspots (label, icono, copy, posición) |
| `src/lib/casa-abierta/scroll-math.ts` | Funciones puras: scroll → translateX, percent → px |
| `src/lib/casa-abierta/scroll-math.test.ts` | Tests `node --test` para `scroll-math.ts` |
| `public/casa-abierta/01-cocina-fuego.webp` … `08-mesa-final.webp` | 8 imágenes panorámicas IA |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/InteractiveExperienceLazy.tsx` | Eliminar dispatch 2D/3D; montar `CasaAbiertaExperience` directamente |

### Archivos eliminados (al final del plan)

| Archivo | Motivo |
|---|---|
| `src/components/InteractiveExperience2D.tsx` | Reemplazado por `CasaAbiertaExperience` |
| `src/components/InteractiveExperience.tsx` | Modo 3D viejo, ya no se usa |
| `src/components/three/SceneContent.tsx` | Dependencia del modo 3D viejo |

---

## Task Breakdown

### Task 1: Crear estructura de carpetas y mover assets

**Files:**
- Create: `src/components/casa-abierta/.gitkeep`
- Create: `src/lib/casa-abierta/.gitkeep`
- Create: `public/casa-abierta/.gitkeep`

- [ ] **Step 1: Crear las carpetas**

```bash
mkdir -p src/components/casa-abierta
mkdir -p src/lib/casa-abierta
mkdir -p public/casa-abierta
touch src/components/casa-abierta/.gitkeep
touch src/lib/casa-abierta/.gitkeep
touch public/casa-abierta/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add src/components/casa-abierta src/lib/casa-abierta public/casa-abierta
git commit -m "chore: scaffold casa-abierta module folders"
```

---

### Task 2: Definir tipos y config de escenas

**Files:**
- Create: `src/lib/casa-abierta/scenes.ts`

- [ ] **Step 1: Escribir el archivo de config**

```typescript
// src/lib/casa-abierta/scenes.ts
/* Configuración de los 3 bloques y las 8 escenas del recorrido.
   El ancho de cada bloque define cuánto scroll vertical = scroll horizontal
   por ese tramo. Cambiar estos valores es la palanca principal de ritmo. */

export type BloqueId = "cocina" | "mesa" | "casa";

export interface SceneConfig {
  id: string;
  bloqueId: BloqueId;
  image: string;          // path bajo /public
  widthPx: number;        // ancho de la panorámica en píxeles
  alt: string;
}

export interface BloqueConfig {
  id: BloqueId;
  label: string;          // título en español venezolano
  scenes: SceneConfig[];
}

export const SCENES: SceneConfig[] = [
  { id: "cocina-fuego", bloqueId: "cocina", image: "/casa-abierta/01-cocina-fuego.webp", widthPx: 1900, alt: "Manos de Antonio en la cocina al fuego" },
  { id: "plato",        bloqueId: "cocina", image: "/casa-abierta/02-plato.webp",        widthPx: 1600, alt: "Plato emplatado en la encimera" },
  { id: "mesa-puesta",  bloqueId: "mesa",   image: "/casa-abierta/03-mesa-puesta.webp",  widthPx: 1800, alt: "Mesa servida con velas y flores" },
  { id: "copas",        bloqueId: "mesa",   image: "/casa-abierta/04-copas.webp",        widthPx: 1600, alt: "Copas servidas en aparador" },
  { id: "ritual",       bloqueId: "mesa",   image: "/casa-abierta/05-ritual.webp",       widthPx: 1600, alt: "Silla retirada y servilleta a medio doblar" },
  { id: "memoria",      bloqueId: "casa",   image: "/casa-abierta/06-memoria.webp",      widthPx: 1700, alt: "Pasillo con marcos de noches pasadas" },
  { id: "despedida",    bloqueId: "casa",   image: "/casa-abierta/07-despedida.webp",    widthPx: 1700, alt: "Antonio y Mila despidiendo al fondo" },
  { id: "mesa-final",   bloqueId: "casa",   image: "/casa-abierta/08-mesa-final.webp",   widthPx: 1400, alt: "Mesa servida en espera del invitado" },
];

export const BLOQUES: BloqueConfig[] = [
  { id: "cocina", label: "La cocina", scenes: SCENES.filter((s) => s.bloqueId === "cocina") },
  { id: "mesa",   label: "La mesa",   scenes: SCENES.filter((s) => s.bloqueId === "mesa") },
  { id: "casa",   label: "La casa",   scenes: SCENES.filter((s) => s.bloqueId === "casa") },
];

export const TRANSITION_WIDTH_PX = 400;  // ancho de la cortina entre bloques

export function getBloqueWidth(bloque: BloqueConfig): number {
  return bloque.scenes.reduce((sum, s) => sum + s.widthPx, 0);
}

export function getTotalCanvasWidth(): number {
  const bloquesWidth = BLOQUES.reduce((sum, b) => sum + getBloqueWidth(b), 0);
  const transitions = (BLOQUES.length - 1) * TRANSITION_WIDTH_PX;
  return bloquesWidth + transitions;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/casa-abierta/scenes.ts
git commit -m "feat(casa-abierta): add scene and bloque config"
```

---

### Task 3: Definir tipos y config de hotspots

**Files:**
- Create: `src/lib/casa-abierta/hotspots.ts`

- [ ] **Step 1: Escribir el archivo de hotspots**

```typescript
// src/lib/casa-abierta/hotspots.ts
/* Cada hotspot vive sobre una escena específica.
   xPercent/yPercent son relativos al bounding box de la imagen (0..100).
   `accentColor` sirve para teñir el detalle y el pulso del marcador. */

export type HotspotIconName = "knife" | "plate" | "candle" | "glass" | "napkin" | "frame";

export interface HotspotConfig {
  id: string;                  // p.ej. "cocina", "plato", "mesa"
  sceneId: string;             // FK a SceneConfig.id
  xPercent: number;
  yPercent: number;
  icon: HotspotIconName;
  label: string;
  sublabel: string;
  content: string;
  image: string;               // imagen real (no IA) que se ve en el overlay
  focus: string;               // CSS object-position para Ken Burns
  accentColor: string;
  isGallery?: boolean;
}

export const HOTSPOTS: HotspotConfig[] = [
  {
    id: "cocina", sceneId: "cocina-fuego",
    xPercent: 38, yPercent: 58, icon: "knife",
    label: "La cocina",
    sublabel: "DONDE NACE TODO",
    content: "Antes de la mesa, el fuego. Cada plato empieza horas antes del primer comensal: ingredientes elegidos a mano, tiempos respetados, técnica al servicio del producto.",
    image: "/antoniococinando.png", focus: "50% 40%", accentColor: "#c97b5c",
  },
  {
    id: "plato", sceneId: "plato",
    xPercent: 52, yPercent: 62, icon: "plate",
    label: "El plato",
    sublabel: "GASTRONOMÍA DE ORIGEN",
    content: "No es solo comida; es una narrativa sobre el producto. Ingredientes de temporada con trazabilidad absoluta, transformados con técnicas que respetan su esencia.",
    image: "/images/dish1.png", focus: "50% 50%", accentColor: "#d4a574",
  },
  {
    id: "mesa", sceneId: "mesa-puesta",
    xPercent: 48, yPercent: 52, icon: "candle",
    label: "La mesa",
    sublabel: "ATMÓSFERA ÍNTIMA",
    content: "Mil focos sutiles y el parpadeo de las velas crean un claroscuro que protege la privacidad. Una luz pensada para que los ojos se relajen y el resto de los sentidos se agudicen.",
    image: "/images/Atento_Catering-3.jpg", focus: "50% 55%", accentColor: "#e0c090",
  },
  {
    id: "alma", sceneId: "copas",
    xPercent: 55, yPercent: 45, icon: "glass",
    label: "El alma",
    sublabel: "MARIDAJE DE AUTOR",
    content: "Vinos seleccionados copa a copa. Viticultores que comparten nuestra pasión por la paciencia. Historias de la tierra, del clima y de noches que merecen ser contadas.",
    image: "/copas.png", focus: "50% 45%", accentColor: "#8B1928",
  },
  {
    id: "ritual", sceneId: "ritual",
    xPercent: 50, yPercent: 60, icon: "napkin",
    label: "El ritual",
    sublabel: "EXPERIENCIA PRIVADA",
    content: "Entrar en Atento es aceptar un pacto de discreción y deleite. Cada paso está coreografiado para una velada que recordarás no solo por lo que probaste, sino por cómo te sentiste.",
    image: "/abrazo.png", focus: "50% 30%", accentColor: "#c9a96e",
  },
  {
    id: "memoria", sceneId: "memoria",
    xPercent: 45, yPercent: 48, icon: "frame",
    label: "La memoria",
    sublabel: "GALERÍA DE NOCHES",
    content: "Un recorrido por los momentos que han definido nuestras mejores mesas.",
    image: "", focus: "50% 50%", accentColor: "#b08968",
    isGallery: true,
  },
];

export function getHotspotsForScene(sceneId: string): HotspotConfig[] {
  return HOTSPOTS.filter((h) => h.sceneId === sceneId);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/casa-abierta/hotspots.ts
git commit -m "feat(casa-abierta): add hotspot config"
```

---

### Task 4: Lógica pura de scroll math (con tests)

**Files:**
- Create: `src/lib/casa-abierta/scroll-math.ts`
- Create: `src/lib/casa-abierta/scroll-math.test.ts`

- [ ] **Step 1: Escribir el test primero**

```typescript
// src/lib/casa-abierta/scroll-math.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scrollToTranslateX,
  percentToPx,
  bloqueProgressForScroll,
} from "./scroll-math.ts";

test("scrollToTranslateX: 0 scroll = 0 translate", () => {
  assert.equal(scrollToTranslateX(0, 1000, 5000, 1024), 0);
});

test("scrollToTranslateX: full scroll = -(canvasWidth - viewport)", () => {
  // scrollHeight 1000 (sin contar viewport), canvas 5000, viewport 1024
  assert.equal(scrollToTranslateX(1000, 1000, 5000, 1024), -(5000 - 1024));
});

test("scrollToTranslateX: half scroll = half pan", () => {
  const result = scrollToTranslateX(500, 1000, 5000, 1024);
  assert.equal(result, -(5000 - 1024) / 2);
});

test("scrollToTranslateX: clamps below 0", () => {
  assert.equal(scrollToTranslateX(-100, 1000, 5000, 1024), 0);
});

test("scrollToTranslateX: clamps above full pan", () => {
  assert.equal(scrollToTranslateX(99999, 1000, 5000, 1024), -(5000 - 1024));
});

test("scrollToTranslateX: viewport bigger than canvas returns 0", () => {
  assert.equal(scrollToTranslateX(500, 1000, 800, 1024), 0);
});

test("percentToPx: 0% = 0", () => {
  assert.equal(percentToPx(0, 1000), 0);
});

test("percentToPx: 100% = total", () => {
  assert.equal(percentToPx(100, 1000), 1000);
});

test("percentToPx: 50% = half", () => {
  assert.equal(percentToPx(50, 1000), 500);
});

test("bloqueProgressForScroll: before bloque starts = 0", () => {
  assert.equal(bloqueProgressForScroll(100, 500, 1500), 0);
});

test("bloqueProgressForScroll: middle of bloque = 0.5", () => {
  assert.equal(bloqueProgressForScroll(1000, 500, 1500), 0.5);
});

test("bloqueProgressForScroll: after bloque ends = 1", () => {
  assert.equal(bloqueProgressForScroll(2000, 500, 1500), 1);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
node --test --experimental-strip-types src/lib/casa-abierta/scroll-math.test.ts
```
Expected: FAIL — `Cannot find module './scroll-math.ts'`

- [ ] **Step 3: Escribir la implementación**

```typescript
// src/lib/casa-abierta/scroll-math.ts
/* Funciones puras del pipeline de scroll horizontal.
   Aisladas para poder testearlas sin DOM.

   Modelo mental: hay un "canvas" horizontal de ancho `canvasWidth` montado
   dentro de un viewport de ancho `viewportWidth`. El scroll vertical va
   desde 0 hasta `maxScrollY` y mapea linealmente a `translateX` desde 0
   hasta `-(canvasWidth - viewportWidth)`. */

export function scrollToTranslateX(
  scrollY: number,
  maxScrollY: number,
  canvasWidth: number,
  viewportWidth: number,
): number {
  if (canvasWidth <= viewportWidth) return 0;
  const maxPan = canvasWidth - viewportWidth;
  const clampedY = Math.max(0, Math.min(maxScrollY, scrollY));
  const progress = maxScrollY > 0 ? clampedY / maxScrollY : 0;
  return -(progress * maxPan);
}

export function percentToPx(percent: number, totalPx: number): number {
  return (percent / 100) * totalPx;
}

/* Progreso (0..1) dentro de un bloque concreto del canvas.
   `bloqueStartX` y `bloqueWidth` están en píxeles del canvas. */
export function bloqueProgressForScroll(
  currentCanvasX: number,
  bloqueStartX: number,
  bloqueWidth: number,
): number {
  if (currentCanvasX <= bloqueStartX) return 0;
  if (currentCanvasX >= bloqueStartX + bloqueWidth) return 1;
  return (currentCanvasX - bloqueStartX) / bloqueWidth;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
node --test --experimental-strip-types src/lib/casa-abierta/scroll-math.test.ts
```
Expected: PASS — todos los tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/casa-abierta/scroll-math.ts src/lib/casa-abierta/scroll-math.test.ts
git commit -m "feat(casa-abierta): add scroll math with node tests"
```

---

### Task 5: Extraer HotspotDetail a su propio archivo

**Files:**
- Create: `src/components/casa-abierta/HotspotDetail.tsx`
- Reference: `src/components/InteractiveExperience2D.tsx:647-869` (componente actual a copiar)

- [ ] **Step 1: Crear el archivo con el componente extraído**

```typescript
// src/components/casa-abierta/HotspotDetail.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { HotspotConfig } from "@/lib/casa-abierta/hotspots";

/* Overlay fullscreen que se abre al clicar un hotspot.
   Reutiliza la mecánica del modo 2D viejo pero acepta HotspotConfig
   (no el shape interno antiguo) y el botón inferior dice
   "Volver al recorrido" en vez de "Volver al plano". */

interface Props {
  hotspot: HotspotConfig;
  onClose: () => void;
}

export default function HotspotDetail({ hotspot, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        overflow: "hidden", background: "#0e1a2e",
      }}
    >
      {hotspot.isGallery ? (
        <GallerySlideshow />
      ) : (
        <KenBurnsImage src={hotspot.image} alt={hotspot.label} focus={hotspot.focus} />
      )}

      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(14,26,46,0.85) 0%, rgba(14,26,46,0.35) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 24, right: 24,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(14,26,46,0.55)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(245,240,232,0.25)",
          color: "rgba(245,240,232,0.85)", fontSize: 18,
          cursor: "pointer", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ✕
      </button>

      <button
        onClick={onClose}
        style={{
          position: "absolute", bottom: 32, left: 32, zIndex: 10,
          background: "rgba(14,26,46,0.55)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(245,240,232,0.22)",
          padding: "10px 22px",
          color: "rgba(245,240,232,0.85)",
          fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        ← Volver al recorrido
      </button>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "clamp(28px, 6vw, 90px)",
          transform: "translateY(-50%)",
          maxWidth: "clamp(280px, 44vw, 540px)",
          zIndex: 5,
          maxHeight: "82vh",
          overflowY: "auto",
          padding: "4px 8px",
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          style={{
            fontSize: 10, letterSpacing: "0.55em", textTransform: "uppercase",
            color: hotspot.accentColor, marginBottom: 18,
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          {hotspot.sublabel}
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55 }}
          style={{
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontStyle: "italic", fontWeight: 400,
            color: "#fff8e8", lineHeight: 1.02, margin: 0,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {hotspot.label}
        </motion.h3>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            width: 52, height: 1, background: hotspot.accentColor,
            opacity: 0.7, margin: "26px 0", transformOrigin: "left",
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          style={{
            fontSize: "1.05rem", lineHeight: 1.85,
            color: "rgba(245,240,232,0.9)",
            fontFamily: "var(--font-work-sans, sans-serif)",
            fontWeight: 300,
          }}
        >
          {hotspot.content}
        </motion.p>
      </div>
    </motion.div>
  );
}

function KenBurnsImage({ src, alt, focus }: { src: string; alt: string; focus: string }) {
  return (
    <motion.div
      initial={{ scale: 1.12 }}
      animate={{ scale: 1 }}
      transition={{ duration: 18, ease: "linear" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        style={{ objectFit: "cover", objectPosition: focus }}
      />
    </motion.div>
  );
}

function GallerySlideshow() {
  /* Placeholder simple — el slideshow viejo vivía dentro de InteractiveExperience2D
     y se puede portar entero después; para MVP basta una imagen estática. */
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0e1a2e" }}>
      <Image
        src="/images/Atento_Catering-3.jpg"
        alt="Galería de noches anteriores"
        fill
        style={{ objectFit: "cover", opacity: 0.85 }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```
Expected: PASS (sin errores TS).

- [ ] **Step 3: Commit**

```bash
git add src/components/casa-abierta/HotspotDetail.tsx
git commit -m "feat(casa-abierta): extract HotspotDetail to standalone component"
```

---

### Task 6: HotspotMarker (círculo con icono y pulso)

**Files:**
- Create: `src/components/casa-abierta/HotspotMarker.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/HotspotMarker.tsx
"use client";

import { motion } from "framer-motion";
import type { HotspotConfig, HotspotIconName } from "@/lib/casa-abierta/hotspots";

interface Props {
  hotspot: HotspotConfig;
  onClick: () => void;
}

export default function HotspotMarker({ hotspot, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir ${hotspot.label}`}
      style={{
        position: "absolute",
        left: `${hotspot.xPercent}%`,
        top: `${hotspot.yPercent}%`,
        transform: "translate(-50%, -50%)",
        width: 44, height: 44,
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        zIndex: 4,
        padding: 0,
      }}
    >
      {/* Halo pulsante */}
      <motion.span
        animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          background: hotspot.accentColor,
          opacity: 0.5,
        }}
      />
      {/* Círculo sólido con icono */}
      <span
        style={{
          position: "absolute", inset: 8,
          borderRadius: "50%",
          background: "rgba(240, 232, 218, 0.94)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hotspot.accentColor,
          boxShadow: `0 0 18px ${hotspot.accentColor}66`,
        }}
      >
        <HotspotIcon name={hotspot.icon} />
      </span>
    </button>
  );
}

function HotspotIcon({ name }: { name: HotspotIconName }) {
  /* SVGs inline para evitar la dep extra de lucide en hotspots tan pequeños.
     Stroke "currentColor" para que tomen el accentColor del padre. */
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "knife":   return <svg {...common}><path d="M3 21l14-14" /><path d="M14 4l6 6-5 5L9 9z" /></svg>;
    case "plate":   return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></svg>;
    case "candle":  return <svg {...common}><path d="M12 3v3" /><rect x="9" y="9" width="6" height="11" rx="1" /><path d="M9 13h6" /></svg>;
    case "glass":   return <svg {...common}><path d="M7 3h10l-1 9a4 4 0 0 1-8 0z" /><path d="M12 12v8" /><path d="M9 20h6" /></svg>;
    case "napkin":  return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 12h16" /><path d="M12 4v16" /></svg>;
    case "frame":   return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="1" /><circle cx="10" cy="10" r="1.5" /><path d="M4 17l5-4 5 3 6-5" /></svg>;
  }
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/casa-abierta/HotspotMarker.tsx
git commit -m "feat(casa-abierta): add HotspotMarker with pulse and icons"
```

---

### Task 7: Bloque (panorámica + hotspots)

**Files:**
- Create: `src/components/casa-abierta/Bloque.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/Bloque.tsx
"use client";

import Image from "next/image";
import type { BloqueConfig } from "@/lib/casa-abierta/scenes";
import { HOTSPOTS } from "@/lib/casa-abierta/hotspots";
import HotspotMarker from "./HotspotMarker";
import type { HotspotConfig } from "@/lib/casa-abierta/hotspots";

interface Props {
  bloque: BloqueConfig;
  onHotspotClick: (hotspot: HotspotConfig) => void;
}

/* Un bloque = todas las escenas de su cluster concatenadas horizontalmente.
   Cada escena es una <img> con ancho fijo (de scenes.ts). Los hotspots
   se posicionan en porcentaje sobre la escena que les corresponde. */
export default function Bloque({ bloque, onHotspotClick }: Props) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexShrink: 0,
      }}
      data-bloque={bloque.id}
    >
      {bloque.scenes.map((scene) => {
        const sceneHotspots = HOTSPOTS.filter((h) => h.sceneId === scene.id);
        return (
          <div
            key={scene.id}
            style={{
              position: "relative",
              width: scene.widthPx,
              height: "100vh",
              flexShrink: 0,
            }}
            data-scene={scene.id}
          >
            <Image
              src={scene.image}
              alt={scene.alt}
              fill
              priority={scene.bloqueId === "cocina"}
              sizes={`${scene.widthPx}px`}
              style={{ objectFit: "cover" }}
            />
            {sceneHotspots.map((h) => (
              <HotspotMarker key={h.id} hotspot={h} onClick={() => onHotspotClick(h)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/casa-abierta/Bloque.tsx
git commit -m "feat(casa-abierta): add Bloque component with embedded hotspots"
```

---

### Task 8: Transition (cortina entre bloques)

**Files:**
- Create: `src/components/casa-abierta/Transition.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/Transition.tsx
"use client";

import { TRANSITION_WIDTH_PX } from "@/lib/casa-abierta/scenes";

/* Cortina visual entre dos bloques.
   Es solo un degradado diagonal — el "blur sweep" es implícito porque
   los dos bloques adyacentes ya tienen contenido distinto. */
export default function Transition() {
  return (
    <div
      style={{
        width: TRANSITION_WIDTH_PX,
        height: "100vh",
        flexShrink: 0,
        background:
          "linear-gradient(105deg, rgba(14,26,46,0.95) 0%, rgba(14,26,46,0.55) 30%, rgba(14,26,46,0.2) 55%, rgba(14,26,46,0.55) 80%, rgba(14,26,46,0.95) 100%)",
        backdropFilter: "blur(8px)",
      }}
      data-transition="true"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/casa-abierta/Transition.tsx
git commit -m "feat(casa-abierta): add Transition curtain between bloques"
```

---

### Task 9: IntroName (intro con nombre del invitado)

**Files:**
- Create: `src/components/casa-abierta/IntroName.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/IntroName.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  guestName: string;
  visible: boolean;
  onComplete: () => void;
}

/* ~3 segundos: pantalla negra → nombre en serif itálica → fade a azul noche.
   El usuario puede saltarla con click/Esc.
   `onComplete` se llama cuando termina la secuencia (o al saltar). */
export default function IntroName({ guestName, visible, onComplete }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onComplete}
          onKeyDown={(e) => { if (e.key === "Escape") onComplete(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "linear-gradient(180deg, #050810 0%, #0e1a2e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "#f0e8da",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => {
              setTimeout(onComplete, 1800);
            }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 10, letterSpacing: "0.55em",
                textTransform: "uppercase",
                opacity: 0.5, marginBottom: 24,
                fontFamily: "var(--font-work-sans, sans-serif)",
              }}
            >
              Bienvenida a Atento
            </p>
            <h2
              style={{
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontStyle: "italic", fontWeight: 400,
                margin: 0, lineHeight: 1,
              }}
            >
              {guestName}
            </h2>
            <p
              style={{
                marginTop: 36, fontSize: 9, letterSpacing: "0.4em",
                textTransform: "uppercase", opacity: 0.4,
                fontFamily: "var(--font-work-sans, sans-serif)",
              }}
            >
              Toca para entrar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/casa-abierta/IntroName.tsx
git commit -m "feat(casa-abierta): add IntroName splash with guest name"
```

---

### Task 10: LetterForm (carta animada con ReservationFlow integrado)

**Files:**
- Create: `src/components/casa-abierta/LetterForm.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/LetterForm.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReservationFlow from "@/components/ReservationFlow";

interface Props {
  guestName: string;
  visible: boolean;
  onClose: () => void;
}

/* Carta de papel que sube desde la base de la pantalla al final del scroll.
   Envuelve el ReservationFlow existente con styling de papel y un toque
   de rotación sutil. */
export default function LetterForm({ guestName, visible, onClose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(14, 26, 46, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ y: "100%", rotate: 1.5 }}
            animate={{ y: "8vh", rotate: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{
              width: "min(680px, 92vw)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#f5ebd6",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.2)",
              padding: "44px 36px 32px",
              borderRadius: "2px 2px 0 0",
              position: "relative",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                position: "absolute", top: 16, right: 16,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(58, 36, 24, 0.08)", border: "none",
                color: "rgba(58, 36, 24, 0.7)", fontSize: 16,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <ReservationFlow initialGuestName={guestName} onComplete={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verificar que `ReservationFlow` acepta esas props**

```bash
grep -n "interface\|export default function\|initialGuestName\|onComplete" src/components/ReservationFlow.tsx | head -20
```
Si **no** las acepta (props que falten), añadirlas en `ReservationFlow.tsx` aceptando `initialGuestName?: string` y `onComplete?: () => void` sin cambiar el resto. Tarea pequeña embebida — máximo 5 minutos.

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/casa-abierta/LetterForm.tsx src/components/ReservationFlow.tsx
git commit -m "feat(casa-abierta): add LetterForm wrapping ReservationFlow"
```

---

### Task 11: CasaAbiertaExperience (wrapper con scroll-jack)

**Files:**
- Create: `src/components/casa-abierta/CasaAbiertaExperience.tsx`

- [ ] **Step 1: Escribir el componente**

```typescript
// src/components/casa-abierta/CasaAbiertaExperience.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { BLOQUES, TRANSITION_WIDTH_PX, getTotalCanvasWidth } from "@/lib/casa-abierta/scenes";
import type { HotspotConfig } from "@/lib/casa-abierta/hotspots";
import Bloque from "./Bloque";
import Transition from "./Transition";
import IntroName from "./IntroName";
import LetterForm from "./LetterForm";
import HotspotDetail from "./HotspotDetail";

interface Props {
  guestName: string;
}

/* Wrapper principal:
   - Maneja Lenis para smooth scroll.
   - Mapea scrollY → translateX del canvas horizontal.
   - El scroll vertical total = canvasWidth (1px scroll vertical = 1px pan horizontal),
     ajustado por un factor para que el ritmo sea cinematográfico.
   - Muestra IntroName la primera vez, LetterForm al final, HotspotDetail al clicar.
*/
const SCROLL_FACTOR = 1; // 1 = pan idéntico al scroll. >1 = pan más rápido.

export default function CasaAbiertaExperience({ guestName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [hotspotOpen, setHotspotOpen] = useState<HotspotConfig | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [canvasWidth] = useState(() => getTotalCanvasWidth());

  /* Lenis smooth scroll */
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  /* scroll-jack: el contenedor exterior tiene altura igual a canvasWidth.
     El sticky inner se queda fijo en viewport mientras el scroll vertical
     mapea a translateX en el canvas horizontal. */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // viewport ancho — lo usamos vía CSS calc en el transform.
  const x = useTransform(scrollYProgress, [0, 1], [`0px`, `calc(-${canvasWidth}px + 100vw)`]);

  /* Detectar fin de scroll para abrir la carta. */
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.985 && !letterOpen) setLetterOpen(true);
    });
    return () => unsubscribe();
  }, [scrollYProgress, letterOpen]);

  return (
    <>
      <IntroName
        guestName={guestName}
        visible={introVisible}
        onComplete={() => setIntroVisible(false)}
      />

      <div
        ref={containerRef}
        style={{
          height: `${canvasWidth * SCROLL_FACTOR}px`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky", top: 0,
            width: "100vw", height: "100vh",
            overflow: "hidden",
            background: "#0e1a2e",
          }}
        >
          <motion.div
            style={{
              x,
              display: "flex",
              height: "100vh",
              width: `${canvasWidth}px`,
            }}
          >
            {BLOQUES.map((bloque, i) => (
              <div key={bloque.id} style={{ display: "flex" }}>
                <Bloque bloque={bloque} onHotspotClick={setHotspotOpen} />
                {i < BLOQUES.length - 1 && <Transition />}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {hotspotOpen && (
          <HotspotDetail hotspot={hotspotOpen} onClose={() => setHotspotOpen(null)} />
        )}
      </AnimatePresence>

      <LetterForm
        guestName={guestName}
        visible={letterOpen}
        onClose={() => setLetterOpen(false)}
      />
    </>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/casa-abierta/CasaAbiertaExperience.tsx
git commit -m "feat(casa-abierta): add CasaAbiertaExperience wrapper with scroll-jack"
```

---

### Task 12: Detectar móvil y crear MobileExperience con scroll-snap

**Files:**
- Create: `src/components/casa-abierta/MobileExperience.tsx`

- [ ] **Step 1: Escribir el componente móvil**

```typescript
// src/components/casa-abierta/MobileExperience.tsx
"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SCENES } from "@/lib/casa-abierta/scenes";
import { HOTSPOTS, type HotspotConfig } from "@/lib/casa-abierta/hotspots";
import HotspotMarker from "./HotspotMarker";
import IntroName from "./IntroName";
import LetterForm from "./LetterForm";
import HotspotDetail from "./HotspotDetail";

interface Props {
  guestName: string;
}

/* En móvil no hay scroll-jack: cada escena ocupa una pantalla completa
   y el usuario hace swipe horizontal nativo entre ellas (scroll-snap).
   Al llegar a la última, la carta sube como en desktop. */
export default function MobileExperience({ guestName }: Props) {
  const [introVisible, setIntroVisible] = useState(true);
  const [hotspotOpen, setHotspotOpen] = useState<HotspotConfig | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  function onScrollEnd(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (atEnd && !letterOpen) setLetterOpen(true);
  }

  return (
    <>
      <IntroName
        guestName={guestName}
        visible={introVisible}
        onComplete={() => setIntroVisible(false)}
      />

      <div
        onScroll={onScrollEnd}
        style={{
          display: "flex",
          width: "100vw", height: "100vh",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          background: "#0e1a2e",
        }}
      >
        {SCENES.map((scene) => {
          const sceneHotspots = HOTSPOTS.filter((h) => h.sceneId === scene.id);
          return (
            <div
              key={scene.id}
              style={{
                position: "relative",
                flex: "0 0 100vw",
                height: "100vh",
                scrollSnapAlign: "center",
              }}
            >
              <Image src={scene.image} alt={scene.alt} fill style={{ objectFit: "cover" }} />
              {sceneHotspots.map((h) => (
                <HotspotMarker key={h.id} hotspot={h} onClick={() => setHotspotOpen(h)} />
              ))}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hotspotOpen && (
          <HotspotDetail hotspot={hotspotOpen} onClose={() => setHotspotOpen(null)} />
        )}
      </AnimatePresence>

      <LetterForm guestName={guestName} visible={letterOpen} onClose={() => setLetterOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/casa-abierta/MobileExperience.tsx
git commit -m "feat(casa-abierta): add MobileExperience with scroll-snap"
```

---

### Task 13: Reescribir InteractiveExperienceLazy para usar Casa Abierta

**Files:**
- Modify: `src/components/InteractiveExperienceLazy.tsx` (reemplazar contenido completo)

- [ ] **Step 1: Reescribir el archivo**

```typescript
// src/components/InteractiveExperienceLazy.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InvitationGate from "@/components/InvitationGate";

const LoadingScreen = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 35%, #f5ebd6 0%, #e8d9bc 45%, #c9a57b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif",
    }}
  >
    <p
      style={{
        fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
        color: "rgba(94, 68, 42, 0.6)",
        animation: "atento-pulse 1.5s ease-in-out infinite",
      }}
    >
      Preparando tu experiencia…
    </p>
    <style>{`
      @keyframes atento-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.9; }
      }
    `}</style>
  </div>
);

const CasaAbiertaDesktop = dynamic(
  () => import("@/components/casa-abierta/CasaAbiertaExperience"),
  { ssr: false, loading: () => <LoadingScreen /> }
);
const CasaAbiertaMobile = dynamic(
  () => import("@/components/casa-abierta/MobileExperience"),
  { ssr: false, loading: () => <LoadingScreen /> }
);

/* Wrapper que decide desktop vs móvil tras el gate de invitación.
   Antes despachaba a 2D/3D — ahora solo "La casa abierta". */
export default function InteractiveExperienceLazy() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (isMobile === null) return <LoadingScreen />;

  if (guestName === null) {
    return <InvitationGate onValid={(name) => setGuestName(name)} />;
  }

  return isMobile ? (
    <CasaAbiertaMobile guestName={guestName} />
  ) : (
    <CasaAbiertaDesktop guestName={guestName} />
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/InteractiveExperienceLazy.tsx
git commit -m "feat: wire CasaAbierta as the only experience after gate"
```

---

### Task 14: Imágenes IA — generar y colocar (manual)

**Files:**
- Create: `public/casa-abierta/01-cocina-fuego.webp` (y los otros 7)

Esta tarea es **manual** (no codigo). Track de la generación, no de la implementación.

- [ ] **Step 1: Prompt base para Flux 1.1 Pro / Midjourney v7**

Para cada una de las 8 escenas en `src/lib/casa-abierta/scenes.ts`, usar prompt base + override por escena. Prompt base:

```
blue hour evening, warm Spanish home interior at dinner time,
[SCENE-SPECIFIC SUBJECT HERE],
cinematic horizontal panorama, anamorphic 21:9 aspect,
golden lamp light spilling onto wood and terracotta surfaces,
deep navy sky visible through windows,
candles, gentle vapor where applicable, intimate unstaged composition,
film grain, shallow depth of field on foreground,
amber #d4a574 cream #f0e8da terracotta #c97b5c palette indoor,
midnight blue #0e1a2e exterior,
no faces in focus, hands or silhouettes only where people appear,
photorealistic, editorial gastronomic style, Chef's Table aesthetic
```

- [ ] **Step 2: Subjects por escena**

| # | id | subject |
|---|---|---|
| 1 | `cocina-fuego` | hands chopping vegetables on wooden board, low angle, steaming copper pot on stove, oil sizzling |
| 2 | `plato` | plated dish on warm wooden counter, garnish being placed, finishing touches, no hands |
| 3 | `mesa-puesta` | set dining table with white linen, lit candles, fresh wildflowers, blue dusk through window |
| 4 | `copas` | sideboard with poured red wine glasses backlit, open bottle, soft warm lamp above |
| 5 | `ritual` | empty dining room moment: slightly pulled-back chair, folded napkin, half-finished wine glass, candle reflections |
| 6 | `memoria` | warm wall hallway with framed photographs of past dinners and laughter, side lamp |
| 7 | `despedida` | wide shot of dining room from doorway, two hosts in distance hugging guest by entrance, faces not visible |
| 8 | `mesa-final` | served dining table alone with candles burning, anticipation, place card with curved handwriting |

- [ ] **Step 3: Outpainting y export**

- Generar cada escena a ~1024 px de alto.
- Outpaint con Flux Fill o Photoshop Generative Fill hasta los anchos de `scenes.ts` (1400-1900 px).
- Mantener coherencia: misma paleta, mismo tipo de luz, mismas texturas de madera y terracota en todas.
- Exportar como WebP (quality 78) en `public/casa-abierta/NN-id.webp`.

- [ ] **Step 4: Verificar tamaños y formato**

```bash
ls -la public/casa-abierta/*.webp
# 8 archivos esperados, tamaño total entre 30 y 60 MB
```

- [ ] **Step 5: Aprobación de Antonio**

Mostrar las 8 imágenes a Antonio. Iterar las que no convenzan. Una vez aprobadas:

- [ ] **Step 6: Commit**

```bash
git add public/casa-abierta/*.webp
git commit -m "assets(casa-abierta): add 8 AI-generated panorama scenes"
```

---

### Task 15: QA visual en desktop

**Files:** ninguno (verificación manual)

- [ ] **Step 1: Levantar dev server**

```bash
npm run dev
```

- [ ] **Step 2: Abrir con código de invitación válido**

Visitar `http://localhost:3000/?code=<código-de-test>` y verificar:

- La intro aparece, muestra el nombre del invitado en serif itálica.
- Tras ~3s o click, la intro se desvanece y aparece la cocina.
- El scroll vertical hace pan horizontal suave (Lenis activo, sin saltos).
- Pan recorre los 3 bloques con las transiciones diagonales entre ellos.
- Los 6 hotspots son clicables y abren el overlay con foto real + texto + Ken Burns.
- Al llegar al final del scroll, la carta sube automáticamente con el formulario.
- Cerrar la carta vuelve al final del recorrido.

- [ ] **Step 3: Anotar regresiones**

Crear `docs/superpowers/qa/2026-05-20-casa-abierta-desktop.md` con cualquier issue visible. Resolver inline antes de avanzar.

---

### Task 16: QA visual en móvil

**Files:** ninguno (verificación manual)

- [ ] **Step 1: Verificar con DevTools en modo responsive (iPhone 12)**

- La intro funciona.
- Las escenas se presentan como slides full-screen con `scroll-snap`.
- Swipe horizontal entre escenas es fluido.
- Hotspots son clicables (área de tap ≥ 44 px).
- El overlay del hotspot funciona.
- Al llegar a la última escena, la carta sube y el formulario es usable.
- Performance: primer paint < 3s en throttle "Fast 3G".

- [ ] **Step 2: Anotar regresiones**

Crear `docs/superpowers/qa/2026-05-20-casa-abierta-mobile.md` con cualquier issue. Resolver inline.

---

### Task 17: Eliminar código obsoleto

**Files:**
- Delete: `src/components/InteractiveExperience2D.tsx`
- Delete: `src/components/InteractiveExperience.tsx`
- Delete: `src/components/three/SceneContent.tsx`

- [ ] **Step 1: Verificar que nadie los importa**

```bash
grep -rn "InteractiveExperience2D\|InteractiveExperience\"\|three/SceneContent" src/ --include="*.tsx" --include="*.ts" | grep -v casa-abierta
```
Expected: vacío (o solo en comentarios).

- [ ] **Step 2: Eliminar archivos**

```bash
rm src/components/InteractiveExperience2D.tsx
rm src/components/InteractiveExperience.tsx
rm src/components/three/SceneContent.tsx
```

- [ ] **Step 3: Eliminar deps no usadas (opcional, si nada de three queda)**

```bash
grep -rn "from \"three\"\|from \"@react-three" src/
```
Si está vacío, desinstalar:
```bash
npm uninstall @react-three/drei @react-three/fiber @react-three/postprocessing @types/three three maath postprocessing
```

- [ ] **Step 4: Verificar build limpio**

```bash
npm run build
```
Expected: build exitoso, sin warnings de imports faltantes.

- [ ] **Step 5: Commit**

```bash
git add -u src/ package.json package-lock.json
git commit -m "chore: remove deprecated 2D and 3D experience components"
```

---

### Task 18: Push y mostrarle a Antonio

- [ ] **Step 1: Push**

```bash
git push origin main
```

- [ ] **Step 2: Deploy preview (Vercel) y compartir URL con Antonio**

Una vez Antonio aprueba todo, mover memoria de proyecto:
- Actualizar `memory/atento-product-flow.md` para reflejar que el modo activo es "La casa abierta".
- Eliminar referencias al plano top-down como modo principal.

---

## Self-Review

**1. Spec coverage**

| Sección spec | Tarea(s) |
|---|---|
| 4.1 Apertura "El nombre" | Task 9 |
| 4.2 Bloque 1 — Cocina | Tasks 2, 7, 14 |
| 4.3 / 4.5 Transiciones | Task 8 |
| 4.4 Bloque 2 — Mesa | Tasks 2, 7, 14 |
| 4.6 Bloque 3 — Casa | Tasks 2, 7, 14 |
| 4.7 Cierre "La carta" | Task 10, 11 |
| 5 Estética y paleta | Distribuida en Tasks 5, 6, 8, 9, 10 |
| 6 Hotspots | Tasks 3, 5, 6, 7 |
| 7.2 Scroll-jack | Task 11 |
| 7.3 Imágenes WebP | Task 14 |
| 7.5 Móvil | Tasks 12, 16 |
| 7.6 Apertura | Task 9 |
| 7.7 Cierre con carta | Task 10 |
| 8 Reutilizar/Nuevos | Tasks 5, 10 (reutiliza), todos los demás (nuevos) |
| 9 Pipeline IA | Task 14 |
| 10 Replicabilidad | Implícito en estructura `scenes.ts` + `hotspots.ts` |
| 11 Riesgos | Mitigaciones en Tasks 11 (scroll-jack tune), 14 (iteración con Antonio), 16 (QA móvil) |

Sin gaps.

**2. Placeholder scan**

Ningún "TBD" / "TODO" / "add error handling" sin contenido. Todos los componentes tienen código completo. Task 14 (imágenes IA) es manual pero con prompts y subjects exactos.

**3. Type consistency**

- `HotspotConfig` se define en `src/lib/casa-abierta/hotspots.ts` (Task 3) y se importa en Tasks 5, 6, 7, 11, 12 sin renombrar.
- `BloqueConfig` y `SceneConfig` se definen en Task 2, se usan en Tasks 7 y 12.
- `IntroName` props: `guestName`, `visible`, `onComplete` — consistentes en Tasks 9, 11, 12.
- `LetterForm` props: `guestName`, `visible`, `onClose` — consistentes en Tasks 10, 11, 12.
- `HotspotDetail` props: `hotspot`, `onClose` — consistentes en Tasks 5, 11, 12.

---

## Execution Handoff

Plan completo y guardado en `docs/superpowers/plans/2026-05-20-atento-casa-abierta-implementation.md`. Dos opciones de ejecución:

**1. Subagent-Driven (recomendada)** — Dispatch de un subagente fresco por tarea, review entre tareas, iteración rápida.

**2. Inline Execution** — Ejecuto las tareas en esta misma sesión usando `executing-plans`, batch con checkpoints para review.

¿Cuál preferís?
