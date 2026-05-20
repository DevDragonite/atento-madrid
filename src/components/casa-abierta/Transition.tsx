"use client";

import { TRANSITION_WIDTH_PX } from "@/lib/casa-abierta/scenes";

/* Cortina visual entre dos bloques.
   Es solo un degradado diagonal — el "blur sweep" es implícito porque
   los dos bloques adyacentes ya tienen contenido distinto. */
export default function Transition() {
  return (
    <div
      style={{
        width: TRANSITION_WIDTH_PX,
        height: "100vh",
        flexShrink: 0,
        background:
          "linear-gradient(105deg, rgba(14,26,46,0.95) 0%, rgba(14,26,46,0.55) 30%, rgba(14,26,46,0.2) 55%, rgba(14,26,46,0.55) 80%, rgba(14,26,46,0.95) 100%)",
        backdropFilter: "blur(8px)",
      }}
      data-transition="true"
    />
  );
}
