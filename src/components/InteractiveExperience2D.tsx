"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import ReservationFlow from "@/components/ReservationFlow";

/* ═══════════════════════════════════════════════════════════════════
   ATENTO — Plano arquitectónico interactivo (vista cenital)
   Un mapa elegante del restaurante. Clickas zonas → zoom suave + foto
   real a pantalla completa con Ken Burns. Cerrar → vuelves al plano.
   Sin scroll, sin WebGL, mobile-friendly.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Coordenadas del plano (viewBox SVG 1000x620) ── */
/* Layout cenital: [COCINA | COMEDOR] lado a lado */

interface Hotspot {
  id: string;
  label: string;
  sublabel: string;
  content: string;
  image: string;
  focus?: string;
  accentColor: string;
  /* Posición en coords del SVG (0-1000 x, 0-620 y) */
  x: number;
  y: number;
  /* Al hacer click, a qué zoom/pan ir (factor + centro) */
  zoom: { scale: number; cx: number; cy: number };
  /* Para la sala reserva, activa el formulario */
  isForm?: boolean;
  /* Para la galería */
  isGallery?: boolean;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "cocina",
    label: "La cocina",
    sublabel: "DONDE NACE TODO",
    content:
      "Antes de la mesa, el fuego. Cada plato empieza horas antes del primer comensal: ingredientes elegidos a mano, tiempos respetados, técnica al servicio del producto.",
    image: "/antoniococinando.png",
    focus: "50% 40%",
    accentColor: "#c97b5c",
    x: 200,
    y: 280,
    zoom: { scale: 2.2, cx: 200, cy: 280 },
  },
  {
    id: "plato",
    label: "El plato",
    sublabel: "GASTRONOMÍA DE ORIGEN",
    content:
      "No es solo comida; es una narrativa sobre el producto. Ingredientes de temporada con trazabilidad absoluta, transformados con técnicas que respetan su esencia.",
    image: "/images/dish1.png",
    focus: "50% 50%",
    accentColor: "#d4a574",
    x: 140,
    y: 440,
    zoom: { scale: 2.2, cx: 140, cy: 440 },
  },
  {
    id: "mesa",
    label: "La mesa",
    sublabel: "ATMÓSFERA ÍNTIMA",
    content:
      "Mil focos sutiles y el parpadeo de las velas crean un claroscuro que protege la privacidad. Una luz pensada para que los ojos se relajen y el resto de los sentidos se agudicen.",
    image: "/images/Atento_Catering-3.jpg",
    focus: "50% 55%",
    accentColor: "#e0c090",
    x: 650,
    y: 310,
    zoom: { scale: 1.8, cx: 650, cy: 310 },
  },
  {
    id: "alma",
    label: "El alma",
    sublabel: "MARIDAJE DE AUTOR",
    content:
      "Vinos seleccionados copa a copa. Viticultores que comparten nuestra pasión por la paciencia. Historias de la tierra, del clima y de noches que merecen ser contadas.",
    image: "/copas.png",
    focus: "50% 45%",
    accentColor: "#8B1928",
    x: 870,
    y: 140,
    zoom: { scale: 2, cx: 870, cy: 140 },
  },
  {
    id: "ritual",
    label: "El ritual",
    sublabel: "EXPERIENCIA PRIVADA",
    content:
      "Entrar en Atento es aceptar un pacto de discreción y deleite. Cada paso está coreografiado para una velada que recordarás no solo por lo que probaste, sino por cómo te sentiste.",
    image: "/abrazo.png",
    focus: "50% 30%",
    accentColor: "#c9a96e",
    x: 540,
    y: 520,
    zoom: { scale: 2, cx: 540, cy: 520 },
  },
  {
    id: "memoria",
    label: "La memoria",
    sublabel: "GALERÍA DE NOCHES",
    content: "Un recorrido por los momentos que han definido nuestras mejores mesas.",
    image: "",
    accentColor: "#b08968",
    x: 870,
    y: 440,
    zoom: { scale: 2.2, cx: 870, cy: 440 },
    isGallery: true,
  },
  {
    id: "reserva",
    label: "Tu silla",
    sublabel: "RESERVA TU NOCHE",
    content:
      "Déjanos saber qué noche tienes en mente, cuántos son y tus preferencias. Antonio y Mila se pondrán en contacto contigo para cerrar los detalles.",
    image: "/images/Atento_Catering-17.jpg",
    focus: "50% 50%",
    accentColor: "#8b6a42",
    x: 770,
    y: 300,
    zoom: { scale: 2, cx: 770, cy: 300 },
    isForm: true,
  },
];

const GALLERY_SLIDESHOW = [
  "/images/Atento_Catering-1.jpg",
  "/images/Atento_Catering-11.jpg",
  "/images/Atento_Catering-22.jpg",
  "/images/Atento_Catering-28.jpg",
  "/images/Atento_Catering-34.jpg",
  "/images/Atento_Catering-40.jpg",
  "/antonio.png",
  "/servir.png",
];

/* ═══════════════════════════════════════════════════════════════════
   ENTRANCE GATE — Registro
   ═══════════════════════════════════════════════════════════════════ */

function EntranceGate({ onSubmit }: { onSubmit: (name: string, email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), email.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 35%, #f5ebd6 0%, #e8d9bc 45%, #c9a57b 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24, zIndex: 100,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.55em", textTransform: "uppercase", color: "rgba(94, 68, 42, 0.7)", marginBottom: 14, fontFamily: "var(--font-work-sans, sans-serif)" }}>
          Madrid · Cena Privada
        </p>
        <h1 style={{ fontSize: "clamp(3.2rem, 8vw, 5.5rem)", fontFamily: "var(--font-playfair, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "#3a2418", lineHeight: 1, margin: 0 }}>
          Atento
        </h1>
        <div style={{ width: 52, height: 1, background: "rgba(58, 36, 24, 0.35)", margin: "22px auto 0" }} />
      </div>

      <form
        onSubmit={handle}
        style={{
          background: "rgba(255, 250, 240, 0.85)",
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(176, 137, 104, 0.35)",
          borderRadius: 4, padding: "44px 36px", width: "100%", maxWidth: 380,
          boxShadow: "0 30px 60px -20px rgba(94, 68, 42, 0.2)",
        }}
      >
        <p style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(94, 68, 42, 0.6)", marginBottom: 32, fontFamily: "var(--font-work-sans, sans-serif)" }}>
          Regístrate para entrar
        </p>
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(94, 68, 42, 0.25)", color: "#3a2418", fontSize: 16, padding: "12px 0", outline: "none", fontFamily: "var(--font-playfair, Georgia, serif)", fontStyle: "italic", textAlign: "center", letterSpacing: "0.03em", marginBottom: 18 }} />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(94, 68, 42, 0.2)", color: "#3a2418", fontSize: 14, padding: "12px 0", outline: "none", fontFamily: "var(--font-work-sans, sans-serif)", textAlign: "center", letterSpacing: "0.05em", marginBottom: 32 }} />
        <button type="submit" style={{ width: "100%", background: "#8b6a42", color: "#fff8e8", border: "none", padding: "15px", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", transition: "background 0.3s", fontFamily: "var(--font-work-sans, sans-serif)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}>
          Entrar
        </button>
      </form>

      <p style={{ marginTop: 30, fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(94, 68, 42, 0.45)", fontFamily: "var(--font-work-sans, sans-serif)", textAlign: "center", maxWidth: 320, lineHeight: 1.8 }}>
        Bienvenido a un espacio pensado solo para ti
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WELCOME — Nombre del invitado
   ═══════════════════════════════════════════════════════════════════ */

function WelcomeIntro({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1 }}
      style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, #f5ebd6 0%, #d4b08a 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        zIndex: 95,
      }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.6, times: [0, 0.25, 0.75, 1] }}
        style={{ fontSize: 10, letterSpacing: "0.65em", textTransform: "uppercase", color: "rgba(58, 36, 24, 0.7)", marginBottom: 18, fontFamily: "var(--font-work-sans, sans-serif)" }}
      >
        Bienvenido
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10] }}
        transition={{ duration: 2.6, times: [0, 0.3, 0.75, 1], delay: 0.15 }}
        style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontFamily: "var(--font-playfair, Georgia, serif)", fontStyle: "italic", color: "#3a2418", margin: 0 }}
      >
        {name}
      </motion.h2>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOOR PLAN SVG — Plano arquitectónico cenital
   Dos zonas: COCINA (izquierda) + COMEDOR (derecha)
   ═══════════════════════════════════════════════════════════════════ */

function FloorPlanSvg({
  onHotspotClick,
  hoveredId,
  setHoveredId,
  isMobile,
  exploredIds,
}: {
  onHotspotClick: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  isMobile: boolean;
  exploredIds: Set<string>;
}) {
  return (
    <svg
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    >
      <defs>
        {/* Patrón sutil de grano para todo el fondo */}
        <pattern id="paper-grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#f5ebd6" />
          <circle cx="1" cy="1" r="0.3" fill="rgba(94, 68, 42, 0.06)" />
          <circle cx="3" cy="3" r="0.3" fill="rgba(94, 68, 42, 0.04)" />
        </pattern>
        {/* Gradiente cálido general */}
        <radialGradient id="floor-gradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fff5e0" />
          <stop offset="70%" stopColor="#f0dfb8" />
          <stop offset="100%" stopColor="#d9c08a" />
        </radialGradient>
        {/* Sombra suave bajo muebles */}
        <filter id="soft-shadow">
          <feGaussianBlur stdDeviation="3" />
          <feOffset dx="1" dy="2" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Glow de hotspots */}
        <radialGradient id="hotspot-glow">
          <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* FONDO GENERAL */}
      <rect x="0" y="0" width="1000" height="620" fill="url(#floor-gradient)" />
      <rect x="0" y="0" width="1000" height="620" fill="url(#paper-grain)" opacity="0.6" />

      {/* MUROS EXTERIORES DEL LOCAL */}
      <rect
        x="60" y="60" width="880" height="500"
        fill="none"
        stroke="#8b6a42"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Sombra interior sutil */}
      <rect x="68" y="68" width="864" height="484" fill="none" stroke="rgba(139, 106, 66, 0.15)" strokeWidth="1" />

      {/* DIVISORIA ENTRE COCINA Y COMEDOR */}
      <line x1="380" y1="60" x2="380" y2="560" stroke="#8b6a42" strokeWidth="2.5" />
      {/* Apertura / pasillo entre ambas */}
      <line x1="380" y1="280" x2="380" y2="360" stroke="url(#floor-gradient)" strokeWidth="5" />

      {/* ══════════════════════════════════════════════════════
          COCINA (izquierda)  x: 60-380, y: 60-560
          ══════════════════════════════════════════════════════ */}

      {/* Piso cocina — ligeramente más frío para distinguirla */}
      <rect x="64" y="64" width="314" height="492" fill="rgba(200, 180, 145, 0.25)" />

      {/* Label zona */}
      <text
        x="220" y="110"
        textAnchor="middle"
        fontFamily="var(--font-work-sans, sans-serif)"
        fontSize="11"
        letterSpacing="6"
        fill="rgba(94, 68, 42, 0.55)"
      >
        COCINA
      </text>

      {/* Isla central de la cocina */}
      <rect
        x="150" y="230" width="140" height="80"
        fill="#c9a57b"
        stroke="#8b6a42"
        strokeWidth="1.5"
        rx="3"
        filter="url(#soft-shadow)"
      />
      <rect x="158" y="238" width="124" height="64" fill="none" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.8" />

      {/* Estufa (arriba) */}
      <rect x="100" y="160" width="90" height="45" fill="#b08968" stroke="#8b6a42" strokeWidth="1.2" rx="2" filter="url(#soft-shadow)" />
      <circle cx="120" cy="182" r="6" fill="#2a1810" />
      <circle cx="140" cy="182" r="6" fill="#2a1810" />
      <circle cx="160" cy="182" r="6" fill="#2a1810" />
      <circle cx="180" cy="182" r="6" fill="#2a1810" />

      {/* Horno (arriba derecha de cocina) */}
      <rect x="270" y="160" width="70" height="45" fill="#8b6a42" stroke="#5c3f26" strokeWidth="1.2" rx="2" filter="url(#soft-shadow)" />
      <rect x="277" y="168" width="56" height="30" fill="#2a1810" opacity="0.4" />

      {/* Mesón de preparación (abajo) */}
      <rect x="90" y="410" width="260" height="55" fill="#c9a57b" stroke="#8b6a42" strokeWidth="1.3" rx="2" filter="url(#soft-shadow)" />
      <line x1="90" y1="432" x2="350" y2="432" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.6" />
      {/* Tabla de cortar */}
      <rect x="120" y="420" width="50" height="32" fill="#e8d9bc" stroke="rgba(139, 106, 66, 0.5)" strokeWidth="0.8" rx="1" />
      {/* Cuencos pequeños */}
      <circle cx="210" cy="438" r="8" fill="rgba(176, 137, 104, 0.8)" stroke="#8b6a42" strokeWidth="0.5" />
      <circle cx="240" cy="438" r="6" fill="rgba(139, 106, 66, 0.7)" stroke="#5c3f26" strokeWidth="0.5" />

      {/* Refrigerador (esquina) */}
      <rect x="90" y="490" width="50" height="55" fill="#d4c0a0" stroke="#8b6a42" strokeWidth="1.3" rx="2" filter="url(#soft-shadow)" />
      <line x1="90" y1="517" x2="140" y2="517" stroke="rgba(139, 106, 66, 0.4)" strokeWidth="0.8" />

      {/* Plantas decorativas */}
      <circle cx="85" cy="105" r="14" fill="rgba(136, 155, 122, 0.6)" />
      <circle cx="85" cy="105" r="8" fill="rgba(120, 140, 105, 0.9)" />

      {/* ══════════════════════════════════════════════════════
          COMEDOR (derecha)  x: 380-940, y: 60-560
          ══════════════════════════════════════════════════════ */}

      <text
        x="660" y="110"
        textAnchor="middle"
        fontFamily="var(--font-work-sans, sans-serif)"
        fontSize="11"
        letterSpacing="6"
        fill="rgba(94, 68, 42, 0.55)"
      >
        COMEDOR
      </text>

      {/* Alfombra bajo la mesa */}
      <rect
        x="470" y="230" width="400" height="180"
        fill="#c97b5c"
        opacity="0.28"
        rx="4"
      />
      <rect x="476" y="236" width="388" height="168" fill="none" stroke="rgba(139, 44, 24, 0.25)" strokeWidth="1" rx="3" />

      {/* Mesa larga central */}
      <rect
        x="510" y="270" width="320" height="95"
        fill="#a47551"
        stroke="#8b6a42"
        strokeWidth="1.8"
        rx="3"
        filter="url(#soft-shadow)"
      />
      {/* Veta de la madera */}
      <line x1="510" y1="297" x2="830" y2="295" stroke="rgba(139, 106, 66, 0.35)" strokeWidth="0.6" />
      <line x1="510" y1="320" x2="830" y2="322" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.6" />
      <line x1="510" y1="345" x2="830" y2="343" stroke="rgba(139, 106, 66, 0.35)" strokeWidth="0.6" />
      {/* Runner (camino de mesa) */}
      <rect x="540" y="306" width="260" height="22" fill="#e8d9bc" opacity="0.75" rx="1" />

      {/* Platos + velas + copas sobre la mesa */}
      {[560, 620, 680, 740, 790].map((x, i) => (
        <g key={`place-${i}`}>
          {/* Plato */}
          <circle cx={x} cy={285} r="9" fill="#faf2e0" stroke="rgba(139, 106, 66, 0.4)" strokeWidth="0.5" />
          <circle cx={x} cy={285} r="6" fill="none" stroke="rgba(201, 169, 110, 0.5)" strokeWidth="0.5" />
          {/* Copa pequeña */}
          <circle cx={x - 13} cy={285} r="2.5" fill="rgba(245, 240, 232, 0.7)" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.3" />
        </g>
      ))}
      {[560, 620, 680, 740, 790].map((x, i) => (
        <g key={`place-btm-${i}`}>
          <circle cx={x} cy={348} r="9" fill="#faf2e0" stroke="rgba(139, 106, 66, 0.4)" strokeWidth="0.5" />
          <circle cx={x} cy={348} r="6" fill="none" stroke="rgba(201, 169, 110, 0.5)" strokeWidth="0.5" />
          <circle cx={x - 13} cy={348} r="2.5" fill="rgba(245, 240, 232, 0.7)" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.3" />
        </g>
      ))}
      {/* Velas centro de mesa */}
      {[600, 670, 740].map((x, i) => (
        <g key={`candle-${i}`}>
          <circle cx={x} cy={317} r="3.5" fill="#c9a96e" />
          <circle cx={x} cy={316} r="1.5" fill="#ffd28c" />
        </g>
      ))}

      {/* Sillas alrededor */}
      {[560, 620, 680, 740, 790].map((x, i) => (
        <rect
          key={`chair-top-${i}`}
          x={x - 12} y={242} width="24" height="14"
          fill="#8b6a42" stroke="#5c3f26" strokeWidth="0.8" rx="2"
          filter="url(#soft-shadow)"
        />
      ))}
      {[560, 620, 680, 740, 790].map((x, i) => (
        <rect
          key={`chair-btm-${i}`}
          x={x - 12} y={377} width="24" height="14"
          fill="#8b6a42" stroke="#5c3f26" strokeWidth="0.8" rx="2"
          filter="url(#soft-shadow)"
        />
      ))}

      {/* Aparador (pared derecha, con vinos) */}
      <rect x="880" y="170" width="48" height="180" fill="#b08968" stroke="#8b6a42" strokeWidth="1.5" rx="2" filter="url(#soft-shadow)" />
      {/* Botellas de vino estilizadas */}
      {[195, 222, 249, 276, 303, 330].map((y, i) => (
        <rect key={`wine-${i}`} x="888" y={y - 3} width="32" height="8" fill="#4a1a1a" rx="1" />
      ))}

      {/* TV/Galería (pared derecha, abajo del aparador) */}
      <rect x="880" y="410" width="48" height="70" fill="#2a1810" stroke="#8b6a42" strokeWidth="1.2" rx="1" filter="url(#soft-shadow)" />
      <rect x="884" y="414" width="40" height="62" fill="#5c3f26" opacity="0.5" />

      {/* Sofá/banco esquina izquierda del comedor */}
      <rect x="410" y="210" width="70" height="30" fill="#c97b5c" stroke="#8b6a42" strokeWidth="1" rx="4" filter="url(#soft-shadow)" opacity="0.85" />

      {/* Mesa auxiliar entrada */}
      <rect x="430" y="490" width="180" height="40" fill="#a47551" stroke="#8b6a42" strokeWidth="1.3" rx="2" filter="url(#soft-shadow)" />

      {/* Puerta de entrada (parte inferior) */}
      <path d="M 540 560 Q 540 530, 580 530" stroke="#8b6a42" strokeWidth="2.5" fill="none" />
      <line x1="540" y1="560" x2="580" y2="530" stroke="rgba(139, 106, 66, 0.3)" strokeWidth="0.5" strokeDasharray="3,2" />

      {/* Plantas en esquinas del comedor */}
      <circle cx="920" cy="105" r="16" fill="rgba(136, 155, 122, 0.55)" />
      <circle cx="920" cy="105" r="9" fill="rgba(120, 140, 105, 0.9)" />
      <circle cx="425" cy="520" r="12" fill="rgba(136, 155, 122, 0.5)" />
      <circle cx="425" cy="520" r="6" fill="rgba(120, 140, 105, 0.85)" />

      {/* ══════════════════════════════════════════════════════
          HOTSPOTS — Puntos interactivos con pulso
          ══════════════════════════════════════════════════════ */}
      {HOTSPOTS.map((h) => {
        const isHovered = hoveredId === h.id;
        const visited = exploredIds.has(h.id);
        /* Tamaños adaptativos: hotspots más grandes y áreas de tap
           más generosas en mobile (dedos, no ratón). */
        const ringR = isMobile ? (isHovered ? 22 : 18) : (isHovered ? 18 : 14);
        const centerR = isMobile ? (isHovered ? 9 : 7) : (isHovered ? 7 : 5);
        const tapR = isMobile ? 48 : 28;
        const glowR = isMobile ? 44 : 36;
        const pulseA = isMobile ? 36 : 30;
        const pulseB = isMobile ? 54 : 44;

        return (
          <g
            key={h.id}
            style={{ cursor: "pointer" }}
            onClick={() => onHotspotClick(h.id)}
            onMouseEnter={() => setHoveredId(h.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Halo exterior pulsante */}
            <circle cx={h.x} cy={h.y} r={glowR} fill="url(#hotspot-glow)">
              <animate
                attributeName="r"
                values={`${pulseA};${pulseB};${pulseA}`}
                dur="2.6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Anillo */}
            <circle
              cx={h.x} cy={h.y} r={ringR}
              fill="none"
              stroke={h.accentColor}
              strokeWidth={isHovered ? 2.2 : 1.5}
              style={{ transition: "all 0.3s ease", opacity: visited ? 0.9 : 1 }}
            />
            {/* Marca de visitado (check dentro del anillo) */}
            {visited && (
              <path
                d={`M ${h.x - 5} ${h.y} L ${h.x - 1} ${h.y + 4} L ${h.x + 6} ${h.y - 4}`}
                fill="none"
                stroke={h.accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Centro (oculto si ya visitado para dar espacio al check) */}
            {!visited && (
              <circle
                cx={h.x} cy={h.y} r={centerR}
                fill={h.accentColor}
                style={{ transition: "all 0.3s ease" }}
              />
            )}
            {/* Área de tap invisible (muy generosa en mobile) */}
            <circle cx={h.x} cy={h.y} r={tapR} fill="transparent" />
            {/* Label emergente solo en desktop con hover */}
            {isHovered && !isMobile && (
              <>
                <rect
                  x={h.x - 62} y={h.y - 54} width="124" height="26"
                  fill="rgba(20, 12, 6, 0.92)"
                  rx="13"
                />
                <text
                  x={h.x} y={h.y - 36}
                  textAnchor="middle"
                  fontFamily="var(--font-playfair, Georgia, serif)"
                  fontStyle="italic"
                  fontSize="13"
                  fill="#fff8e8"
                >
                  {h.label}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Marca pequeña esquina */}
      <text x="80" y="580" fontFamily="var(--font-work-sans, sans-serif)" fontSize="9" letterSpacing="4" fill="rgba(94, 68, 42, 0.4)">
        ATENTO · MADRID
      </text>
      <text x="920" y="580" textAnchor="end" fontFamily="var(--font-work-sans, sans-serif)" fontSize="9" letterSpacing="2" fill="rgba(94, 68, 42, 0.4)">
        PLANO · ESCALA 1:50
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   KEN BURNS — Foto a pantalla completa con zoom/pan lento
   ═══════════════════════════════════════════════════════════════════ */

function KenBurnsImage({ src, alt, focus = "50% 50%" }: { src: string; alt: string; focus?: string }) {
  return (
    <motion.div
      initial={{ scale: 1, x: "0%", y: "0%" }}
      animate={{ scale: 1.08, x: "-2%", y: "-1.5%" }}
      transition={{ duration: 22, ease: "easeOut" }}
      style={{ position: "absolute", inset: "-4%" }}
    >
      <Image src={src} alt={alt} fill sizes="100vw" priority style={{ objectFit: "cover", objectPosition: focus }} />
    </motion.div>
  );
}

/* ── Slideshow para la galería ── */
function GallerySlideshow() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % GALLERY_SLIDESHOW.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.4 }}
          style={{ position: "absolute", inset: "-3%" }}
        >
          <Image src={GALLERY_SLIDESHOW[i]} alt="Momento" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "50% 50%" }} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOTSPOT DETAIL — Overlay fullscreen con foto real + texto
   ═══════════════════════════════════════════════════════════════════ */

function HotspotDetail({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        overflow: "hidden", background: "#140c06",
      }}
    >
      {/* Foto fondo */}
      {hotspot.isGallery ? (
        <GallerySlideshow />
      ) : (
        <KenBurnsImage src={hotspot.image} alt={hotspot.label} focus={hotspot.focus} />
      )}

      {/* Velo direccional */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: hotspot.isForm
            ? "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(20,12,6,0.9) 100%)"
            : "linear-gradient(90deg, rgba(20,12,6,0.85) 0%, rgba(20,12,6,0.35) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(20,12,6,0.4) 0%, transparent 22%, transparent 78%, rgba(20,12,6,0.5) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Cerrar X */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 24, right: 24,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(20,12,6,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(245,240,232,0.25)",
          color: "rgba(245,240,232,0.85)", fontSize: 18,
          cursor: "pointer", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.85)";
          e.currentTarget.style.borderColor = "rgba(245,240,232,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.55)";
          e.currentTarget.style.borderColor = "rgba(245,240,232,0.25)";
        }}
      >
        ✕
      </button>

      {/* Volver al plano */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", bottom: 32, left: 32, zIndex: 10,
          background: "rgba(20,12,6,0.55)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(245,240,232,0.22)",
          padding: "10px 22px",
          color: "rgba(245,240,232,0.85)",
          fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase",
          cursor: "pointer", fontFamily: "var(--font-work-sans, sans-serif)",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.85)";
          e.currentTarget.style.borderColor = "rgba(245,240,232,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.55)";
          e.currentTarget.style.borderColor = "rgba(245,240,232,0.22)";
        }}
      >
        ← Volver al plano
      </button>

      {/* Contenido */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: hotspot.isForm ? "auto" : "clamp(28px, 6vw, 90px)",
          right: hotspot.isForm ? "clamp(28px, 6vw, 90px)" : "auto",
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

        {hotspot.isForm ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
          >
            <p style={{ color: "rgba(245,240,232,0.9)", fontSize: "0.95rem", marginBottom: 28, lineHeight: 1.75, fontFamily: "var(--font-work-sans, sans-serif)", fontWeight: 300 }}>
              Déjanos tus datos y Antonio o Mila se pondrán en contacto contigo para cerrar los detalles de tu noche.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Reserva solicitada. Antonio o Mila te contactarán pronto.");
                onClose();
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <input type="text" placeholder="Tu Nombre Completo" required
                style={inputStyle(hotspot.accentColor)} />
              <input type="email" placeholder="Correo Electrónico" required
                style={inputStyle(hotspot.accentColor)} />
              <input type="date" required
                style={{ ...inputStyle(hotspot.accentColor), colorScheme: "dark" }} />
              <input type="tel" placeholder="Teléfono / WhatsApp"
                style={inputStyle(hotspot.accentColor)} />
              <button type="submit"
                style={{
                  marginTop: 12,
                  background: hotspot.accentColor,
                  color: "#2a1810", border: "none",
                  padding: "15px", fontSize: 11,
                  letterSpacing: "0.4em", textTransform: "uppercase",
                  fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-work-sans, sans-serif)",
                  transition: "filter 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Solicitar Mi Mesa
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.95 }}
            style={{
              fontSize: "clamp(0.95rem, 1.2vw, 1.08rem)",
              lineHeight: 1.9,
              color: "rgba(248, 240, 224, 0.9)",
              fontFamily: "var(--font-work-sans, sans-serif)",
              fontWeight: 300,
              textShadow: "0 1px 10px rgba(0,0,0,0.4)",
            }}
          >
            {hotspot.content}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

const inputStyle = (accent: string): React.CSSProperties => ({
  width: "100%",
  background: "rgba(20,12,6,0.4)",
  border: "none",
  borderBottom: `1px solid ${accent}80`,
  color: "#fff8e8",
  padding: "12px 10px",
  outline: "none",
  fontSize: "15px",
  fontFamily: "var(--font-work-sans, sans-serif)",
  letterSpacing: "0.03em",
  transition: "border-color 0.2s, background 0.2s",
});

/* ═══════════════════════════════════════════════════════════════════
   FLOOR PLAN VIEW — Contenedor con pan/zoom cinemático
   ═══════════════════════════════════════════════════════════════════ */

function FloorPlanView({
  onHotspotClick,
  activeHotspotId,
  isMobile,
  exploredIds,
}: {
  onHotspotClick: (h: Hotspot) => void;
  activeHotspotId: string | null;
  isMobile: boolean;
  exploredIds: Set<string>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  /* Parallax sutil por ratón en el plano (solo desktop) */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 18 });

  useEffect(() => {
    if (isMobile) return;
    const handle = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx * 10);
      mouseY.set(ny * 10);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mouseX, mouseY, isMobile]);

  /* Zoom del plano cuando hay hotspot activo (antes de que abra el overlay) */
  const active = HOTSPOTS.find((h) => h.id === activeHotspotId);

  /* Separamos el hotspot de reserva del resto — "reserva" es CTA principal,
     no un destino de exploración, por eso se trata aparte. */
  const exploreRooms = HOTSPOTS.filter((h) => !h.isForm);
  const reservaHotspot = HOTSPOTS.find((h) => h.isForm);
  const exploredCount = exploreRooms.filter((h) => exploredIds.has(h.id)).length;
  const totalExplore = exploreRooms.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: activeHotspotId ? 0.3 : 1,
        scale: active ? active.zoom.scale : 1,
        x: active
          ? `${(500 - active.zoom.cx) * (active.zoom.scale / 1.5)}px`
          : 0,
        y: active
          ? `${(310 - active.zoom.cy) * (active.zoom.scale / 1.5)}px`
          : 0,
      }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(20px, 4vh, 60px)",
        background:
          "radial-gradient(ellipse at 50% 40%, #faf0d8 0%, #e8d4a5 70%, #c9a57b 100%)",
        overflow: "hidden",
        /* Perspectiva 3D aplicada al contenedor: el plano se inclina
           como si lo miráramos desde un punto alto y hacia adelante,
           manteniendo la estética de plano arquitectónico. */
        perspective: "1800px",
        perspectiveOrigin: "50% 35%",
      }}
    >
      {/* Cabecera flotante con contador de progreso */}
      <div
        style={{
          position: "fixed",
          top: "clamp(14px, 3vh, 32px)",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 15,
          pointerEvents: "none",
        }}
      >
        <p style={{ fontSize: 9, letterSpacing: "0.55em", textTransform: "uppercase", color: "rgba(94, 68, 42, 0.5)", margin: 0, fontFamily: "var(--font-work-sans, sans-serif)" }}>
          Bienvenido a nuestro mundo
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)", fontFamily: "var(--font-playfair, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "#3a2418", margin: "4px 0 0 0", lineHeight: 1 }}>
          Atento
        </h1>
        {/* Contador "X de N rincones descubiertos" */}
        <div
          style={{
            marginTop: 8,
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.55)",
            fontFamily: "var(--font-work-sans, sans-serif)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>
            {exploredCount} de {totalExplore} descubiertos
          </span>
          {/* Mini barrita de progreso */}
          <span
            style={{
              display: "inline-block",
              width: 48,
              height: 2,
              background: "rgba(94, 68, 42, 0.2)",
              borderRadius: 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                right: "auto",
                width: `${(exploredCount / totalExplore) * 100}%`,
                background: "#8b6a42",
                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </span>
        </div>
      </div>

      {/* Hint inferior — solo hasta primer click */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: activeHotspotId || exploredCount > 0 ? 0 : [0, 1, 1, 0.6],
          }}
          transition={{ duration: 5, times: [0, 0.2, 0.75, 1], delay: 0.5 }}
          style={{
            position: "fixed",
            bottom: "clamp(92px, 10vh, 120px)",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.55)",
            fontFamily: "var(--font-work-sans, sans-serif)",
            zIndex: 15,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          Toca los puntos para descubrir cada rincón
        </motion.div>
      )}

      {/* Contenedor del SVG con parallax sutil + inclinación 3D.
          rotateX positivo = el tope del plano se aleja (se ve desde punto alto).
          rotateZ leve = rompe la simetría, más dinámico.
          Framer Motion combina x/y (parallax) + rotateX/rotateZ en un solo transform. */}
      <motion.div
        style={{
          width: "min(100%, 1200px)",
          maxHeight: "100%",
          aspectRatio: "1000 / 620",
          x: smoothX,
          y: smoothY,
          rotateX: 34,
          rotateZ: -1.5,
          transformOrigin: "50% 60%",
          transformStyle: "preserve-3d",
          filter:
            "drop-shadow(0 60px 50px rgba(94, 68, 42, 0.4)) drop-shadow(0 20px 30px rgba(94, 68, 42, 0.25))",
        }}
      >
        <FloorPlanSvg
          onHotspotClick={(id) => {
            const h = HOTSPOTS.find((x) => x.id === id);
            if (h) onHotspotClick(h);
          }}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          isMobile={isMobile}
          exploredIds={exploredIds}
        />
      </motion.div>

      {/* Barra inferior de rooms (mobile) — chips táctiles grandes para
          que el usuario navegue sin tener que acertar puntitos en el plano */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 74,
            left: 0,
            right: 0,
            padding: "10px 12px",
            zIndex: 30,
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            display: "flex",
            gap: 8,
            background: "linear-gradient(180deg, transparent 0%, rgba(20,12,6,0.2) 50%, rgba(20,12,6,0.6) 100%)",
            scrollbarWidth: "none",
          }}
        >
          {exploreRooms.map((h) => {
            const visited = exploredIds.has(h.id);
            return (
              <button
                key={h.id}
                onClick={() => onHotspotClick(h)}
                style={{
                  flexShrink: 0,
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: visited
                    ? "rgba(245, 235, 214, 0.9)"
                    : "rgba(20, 12, 6, 0.75)",
                  color: visited ? "#2a1810" : "#fff8e8",
                  border: `1px solid ${visited ? h.accentColor : `${h.accentColor}90`}`,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontFamily: "var(--font-work-sans, sans-serif)",
                  boxShadow: visited
                    ? "0 4px 14px -4px rgba(94, 68, 42, 0.35)"
                    : "0 4px 14px -4px rgba(0, 0, 0, 0.35)",
                  transition: "all 0.25s ease",
                }}
              >
                {visited ? "✓ " : ""}{h.label}
              </button>
            );
          })}
        </div>
      )}

      {/* CTA flotante RESERVAR MI MESA — siempre visible, en mobile y desktop.
          Es la acción #1 de la página: no dependemos de que encuentren el
          hotspot correcto en el plano. */}
      {reservaHotspot && !activeHotspotId && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={() => onHotspotClick(reservaHotspot)}
          style={{
            position: "fixed",
            bottom: isMobile ? 16 : 32,
            right: isMobile ? 16 : 32,
            left: isMobile ? 16 : "auto",
            padding: isMobile ? "16px 24px" : "16px 32px",
            borderRadius: 999,
            background: "#2a1810",
            color: "#f5ebd6",
            border: "1px solid rgba(201, 169, 110, 0.35)",
            fontSize: 11,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-work-sans, sans-serif)",
            boxShadow: "0 20px 40px -10px rgba(42, 24, 16, 0.55), 0 0 0 4px rgba(245, 235, 214, 0.4)",
            zIndex: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "background 0.3s, transform 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#3a2418";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2a1810";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: 14, letterSpacing: 0, fontFamily: "var(--font-playfair, Georgia, serif)", fontStyle: "italic" }}>✦</span>
          Reservar mi mesa
        </motion.button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  /** Nombre del invitado ya validado por el InvitationGate superior.
      Si se pasa, saltamos el EntranceGate interno y vamos directo al welcome. */
  initialGuestName?: string;
}

export default function InteractiveExperience2D({ initialGuestName }: Props = {}) {
  const [phase, setPhase] = useState<"gate" | "welcome" | "plan">(
    initialGuestName ? "welcome" : "gate"
  );
  const [guestName, setGuestName] = useState(initialGuestName ?? "");
  const [, setGuestEmail] = useState("");
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [exploredIds, setExploredIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);

  /* Detección de viewport mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Esc cierra detalle */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeHotspot) setActiveHotspot(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHotspot]);

  /* Abrir un hotspot:
     - Si es el de reserva (isForm), abrir el wizard multi-paso
     - Si es un destino de exploración, mostrar el HotspotDetail con foto */
  const openHotspot = (h: Hotspot) => {
    setExploredIds((prev) => {
      if (prev.has(h.id)) return prev;
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
    if (h.isForm) {
      setReservationOpen(true);
    } else {
      setActiveHotspot(h);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "gate" && (
          <EntranceGate
            key="gate"
            onSubmit={(n, e) => {
              setGuestName(n);
              setGuestEmail(e);
              setPhase("welcome");
            }}
          />
        )}
        {phase === "welcome" && (
          <WelcomeIntro
            key="welcome"
            name={guestName}
            onDone={() => setPhase("plan")}
          />
        )}
      </AnimatePresence>

      {phase === "plan" && (
        <>
          <FloorPlanView
            activeHotspotId={activeHotspot?.id ?? null}
            onHotspotClick={openHotspot}
            isMobile={isMobile}
            exploredIds={exploredIds}
          />
          <AnimatePresence>
            {activeHotspot && (
              <HotspotDetail
                key={activeHotspot.id}
                hotspot={activeHotspot}
                onClose={() => setActiveHotspot(null)}
              />
            )}
          </AnimatePresence>
          {/* Wizard de reserva multi-paso — se abre al hacer click
              en "Tu silla" o en el CTA flotante "Reservar mi mesa" */}
          <AnimatePresence>
            {reservationOpen && (
              <ReservationFlow
                open={reservationOpen}
                onClose={() => setReservationOpen(false)}
                guestName={guestName}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
