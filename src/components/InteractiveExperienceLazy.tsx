"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InvitationGate from "@/components/InvitationGate";

/* Placeholder de carga */
const LoadingScreen = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 35%, #f5ebd6 0%, #e8d9bc 45%, #c9a57b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
    }}
  >
    <p
      style={{
        fontSize: 10,
        letterSpacing: "0.5em",
        textTransform: "uppercase",
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

const Experience2D = dynamic(
  () => import("@/components/InteractiveExperience2D"),
  { ssr: false, loading: () => <LoadingScreen /> }
);

const Experience3D = dynamic(
  () => import("@/components/InteractiveExperience"),
  { ssr: false, loading: () => <LoadingScreen /> }
);

/**
 * Wrapper con gate de invitación delante de las dos experiencias.
 * - Nadie entra (2D ni 3D) sin código válido.
 * - `?code=XYZ` en la URL valida automáticamente.
 * - `?mode=3d` fuerza 3D (default es 2D).
 * - Cuando el código valida, pasa `initialGuestName` al modo elegido
 *   para que salte su propio gate interno y vaya al welcome directo.
 */
export default function InteractiveExperienceLazy() {
  const [mode, setMode] = useState<"2d" | "3d" | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("mode");
    setMode(requested === "3d" ? "3d" : "2d");
  }, []);

  if (mode === null) return <LoadingScreen />;

  if (guestName === null) {
    return <InvitationGate onValid={(name) => setGuestName(name)} />;
  }

  return mode === "3d" ? (
    <Experience3D initialGuestName={guestName} />
  ) : (
    <Experience2D initialGuestName={guestName} />
  );
}
