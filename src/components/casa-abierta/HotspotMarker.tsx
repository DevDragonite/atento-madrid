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
