"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Handle/URL de Instagram públicos — duplicados aquí porque el cliente
   también los necesita para los enlaces, y el import desde src/lib/invitations
   está bloqueado por "server-only". TODO(Antonio): reemplazar con el usuario real. */
const INSTAGRAM_URL = "https://instagram.com/atento.madrid";
const INSTAGRAM_HANDLE = "@atento.madrid";

type State =
  | "welcome"
  | "code-input"
  | "instagram-cta"
  | "validating"
  | "invalid-notfound"
  | "invalid-expired";

interface Props {
  onValid: (guestName: string) => void;
}

export default function InvitationGate({ onValid }: Props) {
  const [state, setState] = useState<State>("welcome");
  const [code, setCode] = useState("");
  const [initialCheck, setInitialCheck] = useState(true);

  /* Auto-validar si el código viene en la URL (?code=XYZ).
     Antonio mandará a cada cliente un link con su código embebido
     para que no tengan que escribirlo a mano. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code") ?? params.get("invite");
    if (urlCode) {
      setCode(urlCode);
      validate(urlCode);
    } else {
      setInitialCheck(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validate(c: string) {
    setState("validating");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();
      if (data.ok) {
        onValid(data.guestName);
        return;
      }
      setState(data.reason === "expired" ? "invalid-expired" : "invalid-notfound");
    } catch {
      setState("invalid-notfound");
    } finally {
      setInitialCheck(false);
    }
  }

  /* Mientras validamos el código de URL, no mostramos nada
     (evita flicker de "welcome" → "validating"). */
  if (initialCheck) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 35%, #f5ebd6 0%, #e8d9bc 45%, #c9a57b 100%)",
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 35%, #f5ebd6 0%, #e8d9bc 45%, #c9a57b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 100,
      }}
    >
      {/* Cabecera de marca (siempre visible) */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.7)",
            marginBottom: 12,
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          Madrid · Cena Privada
        </p>
        <h1
          style={{
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "#3a2418",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Atento
        </h1>
        <div
          style={{
            width: 52,
            height: 1,
            background: "rgba(58, 36, 24, 0.35)",
            margin: "20px auto 0",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {state === "welcome" && (
          <Welcome
            key="welcome"
            onHasCode={() => setState("code-input")}
            onNeedsCode={() => setState("instagram-cta")}
          />
        )}
        {state === "code-input" && (
          <CodeInput
            key="code-input"
            code={code}
            setCode={setCode}
            onSubmit={(c) => validate(c)}
            onBack={() => setState("welcome")}
            onNeedsHelp={() => setState("instagram-cta")}
          />
        )}
        {state === "instagram-cta" && (
          <InstagramCTA
            key="instagram"
            onBack={() => setState("welcome")}
            onHasCode={() => setState("code-input")}
          />
        )}
        {state === "validating" && <Validating key="validating" />}
        {state === "invalid-notfound" && (
          <InvalidNotFound
            key="invalid-notfound"
            code={code}
            onRetry={() => {
              setCode("");
              setState("code-input");
            }}
          />
        )}
        {state === "invalid-expired" && (
          <InvalidExpired key="invalid-expired" onWrite={() => setState("instagram-cta")} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Pantalla 1: Bienvenida con 2 caminos ── */
function Welcome({
  onHasCode,
  onNeedsCode,
}: {
  onHasCode: () => void;
  onNeedsCode: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: 440 }}
    >
      <p
        style={{
          fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)",
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          color: "#3a2418",
          lineHeight: 1.5,
          margin: "0 0 36px 0",
        }}
      >
        ¿Ya tienes tu carta de invitación?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onHasCode}
          style={primaryBtn()}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}
        >
          Sí, tengo mi código
        </button>
        <button
          onClick={onNeedsCode}
          style={secondaryBtn()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139, 106, 66, 0.08)";
            e.currentTarget.style.borderColor = "rgba(94, 68, 42, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(94, 68, 42, 0.3)";
          }}
        >
          Todavía no
        </button>
      </div>
      <p
        style={{
          marginTop: 36,
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.45)",
          fontFamily: "var(--font-work-sans, sans-serif)",
          lineHeight: 1.9,
        }}
      >
        Un espacio pensado solo para ti
      </p>
    </motion.div>
  );
}

/* ── Pantalla 2: Entrada de código ── */
function CodeInput({
  code,
  setCode,
  onSubmit,
  onBack,
  onNeedsHelp,
}: {
  code: string;
  setCode: (v: string) => void;
  onSubmit: (c: string) => void;
  onBack: () => void;
  onNeedsHelp: () => void;
}) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) onSubmit(code.trim());
      }}
      style={{
        background: "rgba(255, 250, 240, 0.9)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(176, 137, 104, 0.4)",
        borderRadius: 4,
        padding: "40px 36px 32px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 30px 60px -20px rgba(94, 68, 42, 0.25)",
      }}
    >
      <p
        style={{
          textAlign: "center",
          fontSize: 10,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.65)",
          marginBottom: 28,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        Introduce tu código de invitación
      </p>
      <input
        type="text"
        required
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="ATN-XXXX-XXX"
        spellCheck={false}
        autoCapitalize="characters"
        autoComplete="off"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(94, 68, 42, 0.3)",
          color: "#3a2418",
          fontSize: 18,
          padding: "14px 0",
          outline: "none",
          fontFamily: "var(--font-work-sans, monospace)",
          textAlign: "center",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      />
      <button
        type="submit"
        style={primaryBtn()}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}
      >
        Entrar
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        <button type="button" onClick={onBack} style={linkBtn()}>
          ← Volver
        </button>
        <button type="button" onClick={onNeedsHelp} style={linkBtn()}>
          ¿Problema con tu código?
        </button>
      </div>
    </motion.form>
  );
}

/* ── Pantalla 3: CTA a Instagram ── */
function InstagramCTA({
  onBack,
  onHasCode,
}: {
  onBack: () => void;
  onHasCode: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: 460 }}
    >
      <p
        style={{
          fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          color: "#3a2418",
          lineHeight: 1.55,
          margin: "0 0 16px 0",
        }}
      >
        Cada cena en Atento es personal.
      </p>
      <p
        style={{
          fontSize: "clamp(0.9rem, 1.15vw, 1rem)",
          color: "rgba(58, 36, 24, 0.75)",
          lineHeight: 1.8,
          marginBottom: 32,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        Escríbenos por Instagram y Antonio o Mila te enviarán tu carta con tu código único.
      </p>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...primaryBtn(),
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}
      >
        <InstagramIcon />
        Escríbenos en Instagram
      </a>
      <p
        style={{
          marginTop: 14,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.55)",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        {INSTAGRAM_HANDLE}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 32,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        <button type="button" onClick={onBack} style={linkBtn()}>
          ← Volver
        </button>
        <button type="button" onClick={onHasCode} style={linkBtn()}>
          Ya tengo mi código
        </button>
      </div>
    </motion.div>
  );
}

/* ── Pantalla 4: Validando ── */
function Validating() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ textAlign: "center" }}
    >
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{
          fontSize: 11,
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.75)",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        Verificando tu código
      </motion.p>
    </motion.div>
  );
}

/* ── Pantalla 5a: Código no encontrado ── */
function InvalidNotFound({ code, onRetry }: { code: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: 440 }}
    >
      <p
        style={{
          fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          color: "#3a2418",
          lineHeight: 1.5,
          margin: "0 0 14px 0",
        }}
      >
        No encontramos tu código
      </p>
      {code && (
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.55)",
            marginBottom: 14,
            fontFamily: "var(--font-work-sans, monospace)",
          }}
        >
          «{code}»
        </p>
      )}
      <p
        style={{
          fontSize: "clamp(0.9rem, 1.15vw, 1rem)",
          color: "rgba(58, 36, 24, 0.75)",
          lineHeight: 1.8,
          marginBottom: 28,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        Verifica que lo hayas escrito exactamente como te lo enviaron, o escríbenos por Instagram si crees que hay un error.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onRetry} style={primaryBtn()}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}
        >
          Reintentar
        </button>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...secondaryBtn(),
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139, 106, 66, 0.08)";
            e.currentTarget.style.borderColor = "rgba(94, 68, 42, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(94, 68, 42, 0.3)";
          }}
        >
          <InstagramIcon />
          Escríbenos en Instagram
        </a>
      </div>
    </motion.div>
  );
}

/* ── Pantalla 5b: Código expirado ── */
function InvalidExpired({ onWrite }: { onWrite: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", maxWidth: 440 }}
    >
      <p
        style={{
          fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)",
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          color: "#3a2418",
          lineHeight: 1.5,
          margin: "0 0 20px 0",
        }}
      >
        Tu carta ya expiró
      </p>
      <p
        style={{
          fontSize: "clamp(0.9rem, 1.15vw, 1rem)",
          color: "rgba(58, 36, 24, 0.75)",
          lineHeight: 1.8,
          marginBottom: 30,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        Esta invitación ya pasó su fecha. Si quieres reservar otra noche, escríbenos por Instagram y te enviaremos una nueva carta.
      </p>
      <button onClick={onWrite} style={primaryBtn()}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#a47551")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#8b6a42")}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <InstagramIcon />
          Escribirnos en Instagram
        </span>
      </button>
    </motion.div>
  );
}

/* ── Botones compartidos ── */
function primaryBtn(): React.CSSProperties {
  return {
    width: "100%",
    background: "#8b6a42",
    color: "#fff8e8",
    border: "none",
    padding: "15px",
    fontSize: 11,
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-work-sans, sans-serif)",
    transition: "background 0.3s",
  };
}

function secondaryBtn(): React.CSSProperties {
  return {
    width: "100%",
    background: "transparent",
    color: "#3a2418",
    border: "1px solid rgba(94, 68, 42, 0.3)",
    padding: "15px",
    fontSize: 11,
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-work-sans, sans-serif)",
    transition: "background 0.3s, border-color 0.3s",
  };
}

function linkBtn(): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    color: "rgba(94, 68, 42, 0.65)",
    cursor: "pointer",
    fontSize: 9,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    fontFamily: "var(--font-work-sans, sans-serif)",
    padding: 0,
  };
}

/* ── Icono Instagram (SVG inline, evita dependencia externa) ── */
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
