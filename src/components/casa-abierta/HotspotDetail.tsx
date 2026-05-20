// src/components/casa-abierta/HotspotDetail.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { HotspotConfig } from "@/lib/casa-abierta/hotspots";

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
