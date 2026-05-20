"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  guestName: string;
  visible: boolean;
  onComplete: () => void;
}

/* ~3 segundos: pantalla negra → nombre en serif itálica → fade a azul noche.
   El usuario puede saltarla con click/Esc.
   `onComplete` se llama cuando termina la secuencia (o al saltar). */
export default function IntroName({ guestName, visible, onComplete }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onComplete}
          onKeyDown={(e) => { if (e.key === "Escape") onComplete(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "linear-gradient(180deg, #050810 0%, #0e1a2e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "#f0e8da",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => {
              setTimeout(onComplete, 1800);
            }}
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 10, letterSpacing: "0.55em",
                textTransform: "uppercase",
                opacity: 0.5, marginBottom: 24,
                fontFamily: "var(--font-work-sans, sans-serif)",
              }}
            >
              Bienvenida a Atento
            </p>
            <h2
              style={{
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontStyle: "italic", fontWeight: 400,
                margin: 0, lineHeight: 1,
              }}
            >
              {guestName}
            </h2>
            <p
              style={{
                marginTop: 36, fontSize: 9, letterSpacing: "0.4em",
                textTransform: "uppercase", opacity: 0.4,
                fontFamily: "var(--font-work-sans, sans-serif)",
              }}
            >
              Toca para entrar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
