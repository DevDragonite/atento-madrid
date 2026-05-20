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

export const TRANSITION_WIDTH_PX = 400;

export function getBloqueWidth(bloque: BloqueConfig): number {
  return bloque.scenes.reduce((sum, s) => sum + s.widthPx, 0);
}

export function getTotalCanvasWidth(): number {
  const bloquesWidth = BLOQUES.reduce((sum, b) => sum + getBloqueWidth(b), 0);
  const transitions = (BLOQUES.length - 1) * TRANSITION_WIDTH_PX;
  return bloquesWidth + transitions;
}
