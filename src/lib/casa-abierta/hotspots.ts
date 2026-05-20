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
