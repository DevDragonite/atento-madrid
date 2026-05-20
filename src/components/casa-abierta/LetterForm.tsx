"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReservationFlow from "@/components/ReservationFlow";

interface Props {
  guestName: string;
  visible: boolean;
  onClose: () => void;
}

/* Carta de papel que sube desde la base de la pantalla al final del scroll.
   Envuelve el ReservationFlow existente con styling de papel y un toque
   de rotación sutil al entrar. */
export default function LetterForm({ guestName, visible, onClose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(14, 26, 46, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ y: "100%", rotate: 1.5 }}
            animate={{ y: "8vh", rotate: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{
              width: "min(680px, 92vw)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#f5ebd6",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.2)",
              padding: "44px 36px 32px",
              borderRadius: "2px 2px 0 0",
              position: "relative",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                position: "absolute", top: 16, right: 16,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(58, 36, 24, 0.08)", border: "none",
                color: "rgba(58, 36, 24, 0.7)", fontSize: 16,
                cursor: "pointer", zIndex: 2,
              }}
            >
              ✕
            </button>
            <ReservationFlow open={true} onClose={onClose} guestName={guestName} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
