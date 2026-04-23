"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { PerformanceMonitor } from "@react-three/drei";
import SceneContent from "./three/SceneContent";
import type { ViewpointKey } from "./three/SceneContent";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

/* ── Slideshow de la sala galería (componente standalone) ── */
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
          <Image
            src={GALLERY_SLIDESHOW[i]}
            alt="Atento · momento"
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "50% 50%" }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Estilo compartido para inputs del formulario de reserva ── */
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

/* ── Ken Burns layer para hotspots fullscreen ── */
function KenBurns({ src, alt, focus = "50% 50%" }: { src: string; alt: string; focus?: string }) {
  return (
    <motion.div
      initial={{ scale: 1, x: "0%", y: "0%" }}
      animate={{ scale: 1.08, x: "-2%", y: "-1.5%" }}
      transition={{ duration: 22, ease: "easeOut" }}
      style={{ position: "absolute", inset: "-4%" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        priority
        style={{ objectFit: "cover", objectPosition: focus }}
      />
    </motion.div>
  );
}

/* ── GPU / device heuristic for initial quality ── */
function detectInitialQuality(): Quality {
  if (typeof window === "undefined") return "medium";
  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(nav.userAgent);
  if (isMobile || mem <= 4 || cores <= 4) return "low";
  if (mem >= 8 && cores >= 8) return "ultra";
  return "medium";
}

/* ── Helper for dynamic focal point ── */
function DynamicDOF({ activeHotspot, quality }: { activeHotspot: string | null; quality: Quality }) {
  const { camera } = useThree();
  const dofRef = useRef<any>(null);

  useFrame(() => {
    if (!dofRef.current || quality !== "ultra") return;

    // Estimate focus distance based on viewpoint. 
    // In a real setup, we might raycast or track a specific 3D target.
    // For this scene, near is 0.1, far is 100.
    // Overview distance is ~8, Detail is ~2.5.
    const targetDistance = activeHotspot ? 2.8 : 8.0;
    const focus = (targetDistance - camera.near) / (camera.far - camera.near);
    
    // Smoothly update the focusDistance
    dofRef.current.target.focusDistance = focus;
  });

  if (quality !== "ultra") return null;

  return (
    <DepthOfField
      ref={dofRef}
      focalLength={0.05}
      bokehScale={activeHotspot ? 6 : 1.2}
      height={480}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ATENTO MADRID — Immersive 3D Video-Game Experience
   Cinematic camera · Interactive hotspots · No scroll
   ═══════════════════════════════════════════════════════════════════ */

type Scene = "ENTRANCE" | "OPENING" | "ROOM";
export type Quality = "low" | "medium" | "ultra";

/* ── Hotspot content definitions ── */
interface HotspotInfo {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  content: string;
  image: string;
  isForm?: boolean;
  isGallery?: boolean;
}

const HOTSPOTS: HotspotInfo[] = [
  {
    id: "chair",
    label: "Tu Silla",
    sublabel: "SOLICITUD DE RESERVA",
    icon: "🖋️",
    color: "#c9a96e",
    content: "",
    image: "/images/Atento_Catering-17.jpg",
    isForm: true,
  },
  {
    id: "plate",
    label: "El Plato",
    sublabel: "GASTRONOMÍA DE ORIGEN",
    icon: "🍽️",
    color: "#e8d5b7",
    content:
      "No es solo comida; es una narrativa sobre el producto. Seleccionamos ingredientes de temporada con una trazabilidad absoluta, transformándolos con técnicas que respetan su esencia. Cada bocado es un homenaje a la técnica clásica con una mirada contemporánea.",
    image: "/images/dish1.png",
  },
  {
    id: "wine",
    label: "El Alma",
    sublabel: "MARIDAJE DE AUTOR",
    icon: "🍷",
    color: "#8B1928",
    content:
      "Nuestra bodega es una selección emocional. Buscamos viticultores que compartan nuestra pasión por la paciencia. Vinos que hablan de la tierra, del clima y de historias que merecen ser contadas copa a copa mientras la noche avanza.",
    image: "/copas.png",
  },
  {
    id: "ritual",
    label: "El Ritual",
    sublabel: "EXPERIENCIA PRIVADA",
    icon: "✨",
    color: "#c0c0c0",
    content:
      "Entrar en Atento es aceptar un pacto de discreción y deleite. Desde la apertura de las puertas hasta el último café, cada paso está coreografiado para ofrecerte una velada que recordarás no solo por lo que probaste, sino por cómo te sentiste.",
    image: "/abrazo.png",
  },
  {
    id: "candle",
    label: "La Luz",
    sublabel: "ATMÓSFERA ÍNTIMA",
    icon: "🕯️",
    color: "#f0c040",
    content:
      "La iluminación es el alma de la cena. Mil focos sutiles y el parpadeo de las velas crean un claroscuro que protege la privacidad. Un diseño de luz pensado para que los ojos se relajen y el resto de los sentidos se agudicen.",
    image: "/images/Atento_Catering-15.jpg",
  },
  {
    id: "gallery",
    label: "La Memoria",
    sublabel: "GALERÍA DE EVENTOS",
    icon: "🎞️",
    color: "#a0b0d0",
    content: "Un recorrido visual por los momentos que han definido nuestras mejores noches.",
    image: "",
    isGallery: true,
  },
];

/* Fotos que rotan automáticamente en la sala 'gallery' */
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface InteractiveExperienceProps {
  /** Nombre del invitado ya validado por el InvitationGate superior.
      Si se pasa, saltamos el formulario de ENTRANCE y avanzamos directo a OPENING. */
  initialGuestName?: string;
}

export default function InteractiveExperience({ initialGuestName }: InteractiveExperienceProps = {}) {
  /* Si ya tenemos nombre desde el gate, arrancamos en OPENING directamente
     (la secuencia puertas-abriendo-se sigue funcionando). */
  const [scene, setScene]               = useState<Scene>(initialGuestName ? "OPENING" : "ENTRANCE");
  const [guestName, setGuestName]       = useState(initialGuestName ?? "");
  const [guestEmail, setGuestEmail]     = useState("");

  /* Si venimos con nombre precargado, avanzar a ROOM después del intro cinemático */
  useEffect(() => {
    if (initialGuestName && scene === "OPENING") {
      const t = setTimeout(() => setScene("ROOM"), 3500);
      return () => clearTimeout(t);
    }
  }, [initialGuestName, scene]);

  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [roomReady, setRoomReady]       = useState(false);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [isMobile, setIsMobile]         = useState(false);

  /* Check viewport for mobile layout */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Fade in once mounted (avoids flash) */
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  /* Show hotspots after room transition settles */
  useEffect(() => {
    if (scene === "ROOM") {
      const t = setTimeout(() => setRoomReady(true), 2000);
      return () => clearTimeout(t);
    } else {
      setRoomReady(false);
    }
  }, [scene]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeHotspot) {
        setActiveHotspot(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHotspot]);

  /* ── Camera viewpoint logic ── */
  const viewpoint: ViewpointKey = (() => {
    if (scene === "ENTRANCE") return "entrance";
    if (scene === "OPENING") return "throughDoor";
    if (activeHotspot && ["chair", "plate", "wine", "candle", "ritual"].includes(activeHotspot)) {
      return activeHotspot as ViewpointKey;
    }
    return "overview";
  })();

  const [quality, setQuality]           = useState<Quality>("medium");

  /* Auto-detect GPU class on mount (client-only) */
  useEffect(() => {
    setQuality(detectInitialQuality());
  }, []);

  /* Derived: GL/Canvas options based on quality and scene phase */
  const enableShadows      = quality === "ultra";
  const usePostFX          = quality !== "low";
  const enableAntialias    = quality !== "low";
  const dprRange           = useMemo<[number, number]>(
    () => (quality === "ultra" ? [1, 1.75] : quality === "medium" ? [1, 1.5] : [0.75, 1]),
    [quality]
  );
  /* frameloop: 'demand' cuando el 3D no se ve:
     - ENTRANCE: el form cubre toda la pantalla
     - Hotspot activo: el overlay fullscreen con foto cubre todo
     Así la GPU no gasta ciclos renderizando algo invisible. */
  const frameloop: "always" | "demand" =
    scene === "ENTRANCE" || activeHotspot !== null ? "demand" : "always";

  /* ── Handlers ── */
  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setScene("OPENING");
    setTimeout(() => setScene("ROOM"), 3500);
  };

  const handleHotspotClick = (id: string) => {
    setActiveHotspot(activeHotspot === id ? null : id);
  };

  const active = HOTSPOTS.find((h) => h.id === activeHotspot);

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#060402",
        fontFamily: "var(--font-work-sans, sans-serif)",
      }}
    >
      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            style={{
              position: "absolute", inset: 0, zIndex: 200,
              background: "#060402",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.p
              style={{
                fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)",
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Preparando tu experiencia…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          3D CANVAS
          ══════════════════════════════════════════════════════ */}
      <Canvas
        shadows={enableShadows}
        dpr={dprRange}
        frameloop={frameloop}
        gl={{
          powerPreference: "high-performance",
          antialias: enableAntialias,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: isMobile ? 65 : 45, near: 0.1, far: 100, position: [0, 1.8, 8] }}
        style={{ position: "absolute", inset: 0 }}
        onPointerMissed={() => {
          if (scene === "ROOM" && activeHotspot) setActiveHotspot(null);
        }}
      >
        {/* PerformanceMonitor degrada calidad si el FPS cae sostenidamente */}
        <PerformanceMonitor
          onDecline={() => {
            setQuality((q) => (q === "ultra" ? "medium" : q === "medium" ? "low" : "low"));
          }}
        />
        <Suspense fallback={null}>
          <SceneContent
            scene={scene}
            viewpoint={viewpoint}
            activeHotspot={activeHotspot}
            hoveredHotspot={hoveredHotspot}
            onHotspotClick={handleHotspotClick}
            onHotspotHover={setHoveredHotspot}
            quality={quality}
            isMobile={isMobile}
          />
          {usePostFX && (
            <EffectComposer>
              <Bloom
                intensity={quality === "ultra" ? 0.6 : 0.3}
                luminanceThreshold={0.7}
                luminanceSmoothing={0.5}
                mipmapBlur
              />
              {(quality === "ultra" ? (
                <DynamicDOF activeHotspot={activeHotspot} quality={quality} />
              ) : null) as any}
              <Vignette eskil={false} offset={0.25} darkness={0.85} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      {/* ══════════════════════════════════════════════════════
          QUALITY SELECTOR
          ══════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "auto" : 32,
          bottom: isMobile ? 32 : "auto",
          right: isMobile ? "50%" : 32,
          transform: isMobile ? "translateX(50%)" : "none",
          display: "flex",
          gap: "8px",
          zIndex: 50,
        }}
      >
        {(["low", "medium", "ultra"] as Quality[]).map((q) => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            style={{
              padding: "4px 10px",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              backgroundColor: quality === q ? "rgba(201, 169, 110, 0.2)" : "transparent",
              color: quality === q ? "#c9a96e" : "rgba(245, 240, 232, 0.4)",
              border: `1px solid ${quality === q ? "#c9a96e" : "rgba(245, 240, 232, 0.1)"}`,
              borderRadius: "2px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          CSS VIGNETTE + FILM GRAIN (always visible)
          ══════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(6,4,2,0.75) 100%)",
          pointerEvents: "none", zIndex: 5,
        }}
      />

      {/* ══════════════════════════════════════════════════════
          ENTRANCE — Registration form overlay
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === "ENTRANCE" && (
          <motion.div
            key="entrance-ui"
            style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            {/* Brand */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <p
                style={{
                  fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                  color: "rgba(201,169,110,0.65)", marginBottom: 14,
                }}
              >
                Madrid · Cena Privada
              </p>
              <h1
                style={{
                  fontSize: "clamp(3rem, 7vw, 5rem)",
                  fontFamily: "var(--font-playfair, Georgia, serif)",
                  fontStyle: "italic", fontWeight: 400,
                  color: "#f5f0e8", lineHeight: 1,
                }}
              >
                Atento
              </h1>
              <div
                style={{
                  width: 50, height: 1,
                  background: "rgba(201,169,110,0.4)",
                  margin: "18px auto 0",
                }}
              />
            </div>

            {/* Registration card */}
            <form
              onSubmit={handleEnter}
              style={{
                background: "rgba(8,6,4,0.78)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(201,169,110,0.18)",
                borderRadius: 3,
                padding: "40px 34px",
                width: "100%",
                maxWidth: 360,
              }}
            >
              <p
                style={{
                  textAlign: "center", fontSize: 10, letterSpacing: "0.35em",
                  textTransform: "uppercase", color: "rgba(201,169,110,0.55)",
                  marginBottom: 30,
                }}
              >
                Regístrate para entrar
              </p>

              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Tu nombre"
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  color: "#f5f0e8", fontSize: 16, padding: "12px 0",
                  outline: "none", fontFamily: "Georgia, serif",
                  textAlign: "center", letterSpacing: "0.05em",
                  marginBottom: 18,
                }}
              />

              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Tu correo"
                style={{
                  width: "100%", background: "transparent", border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  color: "#f5f0e8", fontSize: 14, padding: "12px 0",
                  outline: "none", textAlign: "center", letterSpacing: "0.05em",
                  marginBottom: 32,
                }}
              />

              <button
                type="submit"
                style={{
                  width: "100%", background: "#c9a96e", color: "#0c0a08",
                  border: "none", padding: "15px",
                  fontSize: 11, letterSpacing: "0.35em",
                  textTransform: "uppercase", fontWeight: 600,
                  cursor: "pointer", transition: "background 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#dfc089")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a96e")}
              >
                Entrar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          OPENING — "Entering" cinematic text
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === "OPENING" && (
          <motion.div
            key="opening-text"
            style={{
              position: "absolute", inset: 0, zIndex: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.p
              style={{
                fontSize: 10, letterSpacing: "0.6em", textTransform: "uppercase",
                color: "rgba(201,169,110,0.6)",
              }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 3, times: [0, 0.4, 1] }}
            >
              Bienvenido, {guestName}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          ROOM — Welcome HUD + instruction
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === "ROOM" && roomReady && !activeHotspot && (
          <motion.div
            key="room-hud"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              top: isMobile ? 24 : 32,
              left: isMobile ? "50%" : 36,
              transform: isMobile ? "translateX(-50%)" : "none",
              textAlign: isMobile ? "center" : "left",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase",
                color: "rgba(201,169,110,0.45)", marginBottom: 6,
              }}
            >
              Tu mesa te espera
            </p>
            <h2
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontStyle: "italic", fontWeight: 400,
                color: "rgba(245,240,232,0.8)", lineHeight: 1.1,
              }}
            >
              {guestName}.
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      <AnimatePresence>
        {scene === "ROOM" && roomReady && !activeHotspot && (
          <motion.p
            key="instruction"
            style={{
              position: "absolute",
              bottom: isMobile ? 80 : 32,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.2)", zIndex: 10,
              pointerEvents: "none", whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            Interactúa con los objetos sobre la mesa
          </motion.p>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          HOTSPOT FULLSCREEN OVERLAY — Foto real con Ken Burns,
          sustituye el panel lateral antiguo. Cubre toda la pantalla.
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeHotspot && active && (
          <motion.div
            key="hotspot-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              overflow: "hidden",
              background: "#140c06",
            }}
          >
            {/* Foto de fondo — Ken Burns o slideshow según tipo */}
            {active.isGallery ? (
              <GallerySlideshow />
            ) : active.image ? (
              <KenBurns src={active.image} alt={active.label} focus={
                active.id === "ritual" ? "50% 30%" :
                active.id === "wine" ? "50% 45%" :
                active.id === "chair" ? "50% 50%" : "50% 50%"
              } />
            ) : null}

            {/* Velo direccional cálido para legibilidad del texto */}
            <div
              style={{
                position: "absolute", inset: 0,
                background: active.isForm
                  ? "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(20,12,6,0.9) 100%)"
                  : "linear-gradient(90deg, rgba(20,12,6,0.85) 0%, rgba(20,12,6,0.35) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
            {/* Velo general superior/inferior */}
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(20,12,6,0.4) 0%, transparent 22%, transparent 78%, rgba(20,12,6,0.5) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Botón cerrar (X) esquina superior derecha */}
            <button
              onClick={() => setActiveHotspot(null)}
              aria-label="Cerrar"
              style={{
                position: "absolute",
                top: 24, right: 24,
                width: 44, height: 44,
                borderRadius: "50%",
                background: "rgba(20,12,6,0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(245,240,232,0.25)",
                color: "rgba(245,240,232,0.85)",
                fontSize: 18,
                cursor: "pointer",
                zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(20,12,6,0.8)";
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(20,12,6,0.55)";
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.25)";
              }}
            >
              ✕
            </button>

            {/* Botón volver a la mesa — esquina inferior izquierda */}
            <button
              onClick={() => setActiveHotspot(null)}
              style={{
                position: "absolute",
                bottom: isMobile ? 20 : 32,
                left: isMobile ? "50%" : 32,
                transform: isMobile ? "translateX(-50%)" : "none",
                background: "rgba(20,12,6,0.55)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(245,240,232,0.22)",
                padding: "10px 22px",
                color: "rgba(245,240,232,0.8)",
                fontSize: 9,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                cursor: "pointer",
                zIndex: 10,
                fontFamily: "var(--font-work-sans, sans-serif)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(20,12,6,0.8)";
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(20,12,6,0.55)";
                e.currentTarget.style.borderColor = "rgba(245,240,232,0.22)";
              }}
            >
              ← Volver a la mesa
            </button>

            {/* Columna de contenido */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: active.isForm
                  ? "auto"
                  : "clamp(28px, 6vw, 90px)",
                right: active.isForm ? "clamp(28px, 6vw, 90px)" : "auto",
                transform: "translateY(-50%)",
                maxWidth: "clamp(280px, 44vw, 540px)",
                zIndex: 5,
                maxHeight: "82vh",
                overflowY: "auto",
                padding: "4px 8px",
              }}
            >
              {/* Sublabel */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.55em",
                  textTransform: "uppercase",
                  color: active.color,
                  marginBottom: 18,
                  fontFamily: "var(--font-work-sans, sans-serif)",
                }}
              >
                {active.sublabel}
              </motion.p>

              {/* Título */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.55 }}
                style={{
                  fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
                  fontFamily: "var(--font-playfair, Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#fff8e8",
                  lineHeight: 1.02,
                  margin: 0,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {active.label}
              </motion.h3>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                style={{
                  width: 52,
                  height: 1,
                  background: active.color,
                  opacity: 0.7,
                  margin: "26px 0",
                  transformOrigin: "left",
                }}
              />

              {/* Contenido según tipo */}
              {active.isForm ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.95 }}
                >
                  <p style={{
                    color: "rgba(245,240,232,0.85)", fontSize: "0.95rem",
                    marginBottom: 28, lineHeight: 1.75,
                    fontFamily: "var(--font-work-sans, sans-serif)",
                    fontWeight: 300,
                  }}>
                    Déjanos tus datos y Antonio o Mila se pondrán en contacto contigo para cerrar los detalles de tu noche.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Reserva solicitada. Antonio o Mila te contactarán pronto.");
                      setActiveHotspot(null);
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <input type="text" placeholder="Tu Nombre Completo" required
                      style={inputStyle(active.color)} />
                    <input type="email" placeholder="Correo Electrónico" required
                      style={inputStyle(active.color)} />
                    <input type="date" required
                      style={{ ...inputStyle(active.color), colorScheme: "dark" }} />
                    <input type="tel" placeholder="Teléfono / WhatsApp"
                      style={inputStyle(active.color)} />
                    <button type="submit"
                      style={{
                        marginTop: 12,
                        background: active.color,
                        color: "#2a1810",
                        border: "none",
                        padding: "15px",
                        fontSize: 11,
                        letterSpacing: "0.4em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        cursor: "pointer",
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
                  {active.content}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
