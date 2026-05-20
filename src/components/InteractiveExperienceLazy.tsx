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
