/* ═══════════════════════════════════════════════════════════════════
   MENÚS — Propuestas gastronómicas reales que Antonio y Mila han
   preparado en cenas anteriores. Se muestran dentro del hotspot
   "El plato" como prueba concreta del estilo de cocina.
   Añadir un menú aquí = nuevo menú en la web, sin tocar UI.
   ═══════════════════════════════════════════════════════════════════ */

export interface MenuCourse {
  /** Etiqueta de la ronda: "Aperitivo", "Entrante", "Principal"... */
  type: string;
  /** Nombre del plato tal cual lo escribirían en su carta */
  name: string;
  /** Descripción narrativa — lo que contaría Antonio si lo explicara en mesa */
  description: string;
}

export interface MenuProposal {
  id: string;
  /** Título del menú (ej. "atento sale de casa · vol. 01") */
  title: string;
  /** Bajada breve — contexto, inspiración, ocasión */
  subtitle?: string;
  /** Fecha aproximada de cuándo se preparó (opcional, para historial) */
  date?: string;
  /** Rondas del menú en orden */
  courses: MenuCourse[];
}

export const MENU_PROPOSALS: MenuProposal[] = [
  {
    id: "propuesta-thai",
    title: "atento · propuesta thai",
    subtitle: "Una noche de cocina asiática preparada en casa.",
    courses: [
      {
        type: "Aperitivo",
        name: "Buñuelo de maíz thai",
        description:
          "Maíz dulce asiático crocante con sweet chili de jengibre y cream fraiche de yuzu y cebollino.",
      },
      {
        type: "Entrante",
        name: "Ensaladilla de gamba y cacahuete",
        description:
          "Ensaladilla rusa asiática con mahonesa de aceite de langostinos junto a una galleta de gamba y una crema de cacahuete.",
      },
      {
        type: "Principal",
        name: "Lubina al curry con coco y mejillones",
        description:
          "Crema de curry con fideos de arroz, maíz baby napado y rostizado con mahonesa de chiles y parmesano, langostino, polvo de avellanas, hierbas y cítricos.",
      },
      {
        type: "Sorbete",
        name: "Sorbete thai",
        description:
          "Sorbete de lima, leche de coco, citronela y coco tostado.",
      },
      {
        type: "Postre",
        name: "Arroz con leche frito",
        description:
          "Arroz con leche frito, té matcha y quenelle de helado de pistacho salado.",
      },
    ],
  },
  /*
   * Plantilla para añadir más menús cuando Antonio y Mila los pasen:
   *
   * {
   *   id: "propuesta-X",
   *   title: "atento · nombre del menú",
   *   subtitle: "Contexto o inspiración en una línea.",
   *   courses: [
   *     { type: "Aperitivo", name: "...", description: "..." },
   *     ...
   *   ],
   * },
   */
];
