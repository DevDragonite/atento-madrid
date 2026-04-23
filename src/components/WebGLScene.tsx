"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

// ─── Scene state types ────────────────────────────────────────────────────────
type Scene = "ENTRANCE" | "OPENING" | "TABLE";

// ─── Hotspot definitions – coordinates are % of the image dimensions ─────────
const TABLE_HOTSPOTS = [
  {
    id: "chair",
    label: "Aparta Tu Silla",
    sublabel: "Reservaciones",
    icon: "🪑",
    cx: "22%", cy: "50%", r: "7%",
    color: "#c9a96e",
    description: "Elige tu asiento en nuestra mesa privada de 8 comensales para la experiencia completa.",
    href: "#reservar",
  },
  {
    id: "plate",
    label: "Conoce el Menú",
    sublabel: "Fusión Gastronómica",
    icon: "🍽",
    cx: "50%", cy: "42%", r: "8%",
    color: "#e8d5b7",
    description: "12 pasos de cocina fusión diseñados por nuestro Head Chef. Temporada Otoño 2025.",
    href: "#menu",
  },
  {
    id: "wine",
    label: "Maridaje",
    sublabel: "Cava & Vinos",
    icon: "🍷",
    cx: "68%", cy: "35%", r: "5%",
    color: "#8B1928",
    description: "Selección de vinos naturales de Rioja, Ribera del Duero y referencias internacionales.",
    href: "#vinos",
  },
  {
    id: "cutlery",
    label: "Experiencia",
    sublabel: "El Ritual Atento",
    icon: "🔱",
    cx: "38%", cy: "55%", r: "5%",
    color: "#a0a0a0",
    description: "Cada gesto en la mesa es parte del servicio. Descubre el protocolo de una cena privada.",
    href: "#experiencia",
  },
  {
    id: "candle",
    label: "El Espacio",
    sublabel: "Casa Atento",
    icon: "🕯",
    cx: "50%", cy: "22%", r: "5%",
    color: "#f0c040",
    description: "Una casa privada en el corazón de Madrid. Solo 8 personas por noche.",
    href: "#espacio",
  },
];

// ─── Entrance / Doors Scene ─────────────────────────────────────────────────
function EntranceScene({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onEnter(name.trim());
  };

  return (
    <>
      {/* Full-bleed entrance photo */}
      <div className="absolute inset-0">
        <img
          src="/vip-entrance.jpg"
          alt="Atento Madrid VIP Entrance"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.65)" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)"
        }} />
      </div>

      {/* Registration card */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        {/* Logo / brand mark */}
        <div className="mb-8 text-center">
          <p className="text-xs tracking-[0.5em] uppercase mb-3"
            style={{ color: "#c9a96e", fontFamily: "var(--font-work-sans, sans-serif)" }}>
            Madrid · Cena Privada
          </p>
          <h1 className="text-5xl md:text-6xl italic mb-1"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "#f5f0e8" }}>
            Atento
          </h1>
          <div style={{ width: 60, height: 1, background: "#c9a96e", margin: "12px auto" }} />
        </div>

        {/* The card */}
        <form onSubmit={handleSubmit}
          style={{
            background: "rgba(8, 6, 4, 0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(201, 169, 110, 0.25)",
            borderRadius: 4,
            padding: "40px 36px",
            width: "100%",
            maxWidth: 380,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}>
          <p className="text-center text-xs tracking-[0.3em] uppercase mb-8"
            style={{ color: "rgba(201, 169, 110, 0.8)", fontFamily: "var(--font-work-sans, sans-serif)" }}>
            Identifícate para entrar
          </p>

          {/* Name field */}
          <div className="mb-5 relative">
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              placeholder="Tu nombre"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${focused === "name" ? "#c9a96e" : "rgba(255,255,255,0.15)"}`,
                color: "#f5f0e8",
                fontSize: 17,
                padding: "8px 0",
                outline: "none",
                fontFamily: "Georgia, serif",
                transition: "border-color 0.3s",
                textAlign: "center",
                letterSpacing: "0.05em",
              }}
            />
          </div>

          {/* Email field */}
          <div className="mb-8 relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="Tu correo (opcional)"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${focused === "email" ? "#c9a96e" : "rgba(255,255,255,0.15)"}`,
                color: "#f5f0e8",
                fontSize: 15,
                padding: "8px 0",
                outline: "none",
                fontFamily: "var(--font-work-sans, sans-serif)",
                transition: "border-color 0.3s",
                textAlign: "center",
                letterSpacing: "0.05em",
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full relative overflow-hidden group"
            style={{
              background: "#c9a96e",
              color: "#0c0a08",
              border: "none",
              padding: "16px",
              fontSize: 11,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-work-sans, sans-serif)",
              transition: "background 0.4s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e8c88a")}
            onMouseLeave={e => (e.currentTarget.style.background = "#c9a96e")}
          >
            Entrar
          </button>
        </form>
      </motion.div>
    </>
  );
}

// ─── Door Opening Animation ─────────────────────────────────────────────────
function DoorOpeningScene({ onComplete }: { onComplete: () => void }) {
  // Use a plain timer — onAnimationComplete can be unreliable with AnimatePresence
  const hasCalledBack = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasCalledBack.current) {
        hasCalledBack.current = true;
        onComplete();
      }
    }, 2200); // slightly longer than the 1.6s + 0.2s delay
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="absolute inset-0" style={{ overflow: "hidden" }}>
      {/* Base image – the warm room behind the doors */}
      <img
        src="/table-overhead.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.6) saturate(0.8)" }}
      />

      {/* LEFT DOOR PANEL – slides off to the left */}
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{ width: "50%", overflow: "hidden" }}
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      >
        {/* Show left half of the entrance photo */}
        <img
          src="/vip-entrance.jpg"
          alt=""
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "200%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left center",
            filter: "brightness(0.7)",
          }}
        />
      </motion.div>

      {/* RIGHT DOOR PANEL – slides off to the right */}
      <motion.div
        className="absolute inset-y-0 right-0"
        style={{ width: "50%", overflow: "hidden" }}
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      >
        {/* Show right half of the entrance photo */}
        <img
          src="/vip-entrance.jpg"
          alt=""
          style={{
            position: "absolute",
            top: 0, right: 0, left: "auto",
            width: "200%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            filter: "brightness(0.7)",
          }}
        />
      </motion.div>

      {/* Bright flash of light as the doors fully separate */}
      <motion.div
        style={{ position: "absolute", inset: 0, background: "#f5e8d0", pointerEvents: "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.25, 0] }}
        transition={{ duration: 2.2, times: [0, 0.55, 0.75, 1] }}
      />
    </div>
  );
}

// ─── Interactive Table Scene ─────────────────────────────────────────────────
function TableScene({ guestName }: { guestName: string }) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });
  const imgX = useTransform(springX, [-1, 1], ["-1.5%", "1.5%"]);
  const imgY = useTransform(springY, [-1, 1], ["-1.5%", "1.5%"]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }, [mouseX, mouseY]);

  const activeSpot = TABLE_HOTSPOTS.find(h => h.id === activeHotspot);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Parallax table photo */}
      <motion.div
        className="absolute"
        style={{
          inset: "-3%",
          x: imgX,
          y: imgY,
        }}
      >
        <img
          src="/table-overhead.jpg"
          alt="Mesa Atento"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.75) contrast(1.05)" }}
        />
        {/* Vignette */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)"
        }} />
      </motion.div>

      {/* SVG Hotspot Overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ pointerEvents: "none" }}
      >
        {TABLE_HOTSPOTS.map(spot => {
          const isHovered = hoveredHotspot === spot.id;
          const isActive = activeHotspot === spot.id;
          // Remove % for SVG units
          const cx = parseFloat(spot.cx);
          const cy = parseFloat(spot.cy);
          const r = parseFloat(spot.r);

          return (
            <g key={spot.id} style={{ pointerEvents: "all", cursor: "pointer" }}
              onMouseEnter={() => setHoveredHotspot(spot.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              onClick={() => setActiveHotspot(isActive ? null : spot.id)}
            >
              {/* Outer pulse ring */}
              <circle
                cx={cx} cy={cy} r={isHovered ? r + 2.5 : r + 1}
                fill="none"
                stroke={spot.color}
                strokeWidth={isHovered ? 0.5 : 0.25}
                opacity={isHovered ? 0.8 : 0.4}
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Animated breathing ring */}
              <circle
                cx={cx} cy={cy} r={r + 3.5}
                fill="none"
                stroke={spot.color}
                strokeWidth={0.15}
                opacity={isHovered ? 0 : 0.2}
                className="animate-ping"
                style={{ animationDuration: "2.5s", animationDelay: `${Math.random() * 1}s` }}
              />
              {/* Main hit area */}
              <circle
                cx={cx} cy={cy} r={r}
                fill={isHovered || isActive ? `${spot.color}30` : "transparent"}
                stroke={spot.color}
                strokeWidth={isHovered || isActive ? 0.5 : 0.3}
                opacity={isActive ? 1 : 0.6}
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Icon dot */}
              <circle
                cx={cx} cy={cy} r={0.8}
                fill={spot.color}
                opacity={isHovered || isActive ? 1 : 0.5}
                style={{ transition: "all 0.3s ease" }}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating labels that appear on hover */}
      {TABLE_HOTSPOTS.map(spot => {
        const isHovered = hoveredHotspot === spot.id;
        return (
          <AnimatePresence key={`label-${spot.id}`}>
            {isHovered && activeHotspot !== spot.id && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: spot.cx,
                  top: spot.cy,
                  transform: "translate(-50%, -120%)",
                }}
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.92 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{
                  background: "rgba(8, 6, 4, 0.9)",
                  border: `1px solid ${spot.color}50`,
                  backdropFilter: "blur(12px)",
                  padding: "8px 14px",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}>
                  <p style={{
                    color: spot.color,
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-work-sans, sans-serif)",
                    fontWeight: 500,
                  }}>{spot.label}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}

      {/* Welcome HUD top-left */}
      <motion.div
        className="absolute top-8 left-8 pointer-events-none"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p style={{ color: "rgba(201,169,110,0.6)", fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontFamily: "var(--font-work-sans, sans-serif)", marginBottom: 4 }}>
          Bienvenido
        </p>
        <h2 style={{ color: "#f5f0e8", fontSize: 26, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1 }}>
          {guestName}.
        </h2>
      </motion.div>

      {/* Instruction bar bottom */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 pointer-events-none flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <p style={{ 
          color: "rgba(245,240,232,0.35)", 
          fontSize: 10, 
          letterSpacing: "0.35em", 
          textTransform: "uppercase",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}>
          Toca los elementos sobre la mesa
        </p>
      </motion.div>

      {/* SIDE PANEL for active hotspot */}
      <AnimatePresence>
        {activeHotspot && activeSpot && (
          <motion.div
            className="absolute top-0 right-0 h-full"
            style={{ width: "min(380px, 38vw)", zIndex: 20 }}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Frosted glass panel */}
            <div style={{
              width: "100%",
              height: "100%",
              background: "rgba(4, 3, 2, 0.82)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderLeft: `1px solid ${activeSpot.color}25`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 40px",
            }}>
              {/* Close */}
              <button
                onClick={() => setActiveHotspot(null)}
                style={{
                  position: "absolute",
                  top: 28, right: 28,
                  background: "transparent",
                  border: "none",
                  color: "rgba(245,240,232,0.4)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                  fontFamily: "sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f5f0e8")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(245,240,232,0.4)")}
              >
                ✕
              </button>

              {/* Icon */}
              <motion.p
                style={{ fontSize: 40, marginBottom: 20, lineHeight: 1 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >{activeSpot.icon}</motion.p>

              {/* Category */}
              <p style={{ 
                color: activeSpot.color, 
                fontSize: 10, 
                letterSpacing: "0.45em", 
                textTransform: "uppercase",
                fontFamily: "var(--font-work-sans, sans-serif)",
                marginBottom: 12,
              }}>{activeSpot.sublabel}</p>

              {/* Title */}
              <h3 style={{ 
                color: "#f5f0e8", 
                fontSize: 32, 
                fontFamily: "Georgia, serif", 
                fontStyle: "italic",
                lineHeight: 1.1,
                marginBottom: 20,
              }}>{activeSpot.label}</h3>

              {/* Divider */}
              <div style={{ width: 40, height: 1, background: activeSpot.color, marginBottom: 24, opacity: 0.6 }} />

              {/* Description */}
              <p style={{ 
                color: "rgba(245,240,232,0.6)", 
                fontSize: 14, 
                lineHeight: 1.7,
                fontFamily: "var(--font-work-sans, sans-serif)",
                marginBottom: 36,
              }}>{activeSpot.description}</p>

              {/* CTA */}
              <a
                href={activeSpot.href}
                style={{
                  display: "inline-block",
                  background: activeSpot.color,
                  color: "#0c0a08",
                  padding: "14px 24px",
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontFamily: "var(--font-work-sans, sans-serif)",
                  textAlign: "center",
                  transition: "opacity 0.3s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Descubrir
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Orchestrator ───────────────────────────────────────────────────────
export default function WebGLScene() {
  const [scene, setScene] = useState<Scene>("ENTRANCE");
  const [guestName, setGuestName] = useState("");

  const handleEnter = (name: string) => {
    setGuestName(name);
    setScene("OPENING");
  };

  const handleOpeningComplete = () => {
    setScene("TABLE");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#060402", overflow: "hidden" }}>
      {/* Entrance: visible only when scene === ENTRANCE */}
      <AnimatePresence>
        {scene === "ENTRANCE" && (
          <motion.div
            key="entrance"
            className="absolute inset-0"
            style={{ zIndex: 30 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EntranceScene onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Door opening: layered on top, disappears automatically via timer */}
      <AnimatePresence>
        {scene === "OPENING" && (
          <motion.div
            key="opening"
            className="absolute inset-0"
            style={{ zIndex: 40 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DoorOpeningScene onComplete={handleOpeningComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table: always rendered underneath, fades in */}
      <AnimatePresence>
        {scene === "TABLE" && (
          <motion.div
            key="table"
            className="absolute inset-0"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <TableScene guestName={guestName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
