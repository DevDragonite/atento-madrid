"use client";

import { motion } from "framer-motion";
import { MENU_PROPOSALS } from "@/lib/menus";

/* ═══════════════════════════════════════════════════════════════════
   MENU PROPOSALS — Lista de cartas reales preparadas por Antonio y Mila.
   Se muestra dentro del hotspot "El plato" tras la filosofía.
   Diseño: tipografía de carta de restaurante, no tabla.
   Usa colores invertidos (crema sobre velo oscuro) porque el overlay
   del hotspot ya tiene fondo de foto atenuado.
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  /** Color de acento heredado del hotspot (ej. accent del plato) */
  accentColor?: string;
}

export default function MenuProposals({ accentColor = "#d4a574" }: Props) {
  if (MENU_PROPOSALS.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.3 }}
      style={{ marginTop: 44 }}
    >
      {/* Separador elegante — anuncia que viene nueva sección */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background: `${accentColor}55`,
          }}
        />
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: accentColor,
            fontFamily: "var(--font-work-sans, sans-serif)",
            whiteSpace: "nowrap",
          }}
        >
          Algunas propuestas
        </p>
        <div
          style={{
            flex: 1,
            height: 1,
            background: `${accentColor}55`,
          }}
        />
      </div>

      <p
        style={{
          fontSize: "clamp(0.9rem, 1.15vw, 1rem)",
          lineHeight: 1.8,
          color: "rgba(248, 240, 224, 0.72)",
          fontFamily: "var(--font-work-sans, sans-serif)",
          fontWeight: 300,
          marginBottom: 36,
          fontStyle: "italic",
        }}
      >
        Así se traducen estas ideas en la mesa. Algunos menús que ya
        preparamos — cada cena es única, pero esto da una noción del estilo.
      </p>

      {MENU_PROPOSALS.map((menu) => (
        <MenuCard key={menu.id} menu={menu} accentColor={accentColor} />
      ))}
    </motion.div>
  );
}

function MenuCard({
  menu,
  accentColor,
}: {
  menu: typeof MENU_PROPOSALS[number];
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(20, 12, 6, 0.35)",
        border: `1px solid ${accentColor}30`,
        borderRadius: 2,
        padding: "clamp(24px, 3.5vw, 38px)",
        marginBottom: 24,
      }}
    >
      {/* Cabecera del menú */}
      <h4
        style={{
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.3rem, 2.4vw, 1.65rem)",
          color: "#fff8e8",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {menu.title}
      </h4>
      {menu.subtitle && (
        <p
          style={{
            fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
            color: `${accentColor}dd`,
            fontFamily: "var(--font-work-sans, sans-serif)",
            marginTop: 8,
            fontWeight: 300,
          }}
        >
          {menu.subtitle}
        </p>
      )}
      {menu.date && (
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(248, 240, 224, 0.4)",
            fontFamily: "var(--font-work-sans, sans-serif)",
            marginTop: 6,
          }}
        >
          {menu.date}
        </p>
      )}

      {/* Divider dentro de la carta */}
      <div
        style={{
          width: 36,
          height: 1,
          background: `${accentColor}70`,
          margin: "22px 0 28px",
        }}
      />

      {/* Rondas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {menu.courses.map((c, idx) => (
          <div key={idx}>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: accentColor,
                fontFamily: "var(--font-work-sans, sans-serif)",
                marginBottom: 6,
              }}
            >
              {c.type}
            </p>
            <p
              style={{
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontStyle: "italic",
                fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
                color: "#fff8e8",
                margin: "0 0 6px 0",
                lineHeight: 1.3,
                fontWeight: 400,
              }}
            >
              {c.name}
            </p>
            <p
              style={{
                fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                color: "rgba(248, 240, 224, 0.72)",
                fontFamily: "var(--font-work-sans, sans-serif)",
                lineHeight: 1.75,
                fontWeight: 300,
              }}
            >
              {c.description}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
