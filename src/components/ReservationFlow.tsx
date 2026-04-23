"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════
   RESERVATION FLOW — Wizard de reserva extendida
   5 pasos + resumen + confirmación. Al enviar: POST /api/reservation
   → cotización calculada en server → Telegram a Antonio.
   El cliente NUNCA ve precios.
   ═══════════════════════════════════════════════════════════════════ */

type Step =
  | "date"
  | "party"
  | "restrictions"
  | "preferences"
  | "contact"
  | "review"
  | "sending"
  | "sent"
  | "error";

const STEPS_VISIBLE: Step[] = [
  "date",
  "party",
  "restrictions",
  "preferences",
  "contact",
];

interface FormData {
  eventDate: string;
  alternateDate: string;
  eventTime: "lunch" | "dinner" | "brunch" | "other";
  eventTimeOther: string;

  partySize: number;
  occasion:
    | "intimate"
    | "birthday"
    | "anniversary"
    | "business"
    | "reunion"
    | "celebration"
    | "other";
  occasionOther: string;

  allergies: string[];
  diet:
    | "none"
    | "vegetarian"
    | "vegan"
    | "pescatarian"
    | "gluten-free"
    | "halal"
    | "kosher"
    | "other";
  dietOther: string;
  restrictionsNotes: string;

  experienceType: "surprise" | "preference" | "full-tasting" | "short-menu";
  foodPreferences: string;
  winePreference: "red" | "white" | "rose" | "sparkling" | "pairing" | "none";

  email: string;
  phone: string;
  contactTime: string;
  additionalNotes: string;
}

const INITIAL: FormData = {
  eventDate: "",
  alternateDate: "",
  eventTime: "dinner",
  eventTimeOther: "",
  partySize: 4,
  occasion: "intimate",
  occasionOther: "",
  allergies: [],
  diet: "none",
  dietOther: "",
  restrictionsNotes: "",
  experienceType: "surprise",
  foodPreferences: "",
  winePreference: "pairing",
  email: "",
  phone: "",
  contactTime: "",
  additionalNotes: "",
};

const ALLERGY_OPTIONS = [
  "Gluten",
  "Lactosa",
  "Mariscos",
  "Frutos secos",
  "Pescado",
  "Huevo",
  "Soja",
  "Sulfitos",
];

interface Props {
  open: boolean;
  onClose: () => void;
  guestName: string;
  invitationCode?: string;
}

export default function ReservationFlow({
  open,
  onClose,
  guestName,
  invitationCode,
}: Props) {
  const [step, setStep] = useState<Step>("date");
  const [data, setData] = useState<FormData>(INITIAL);
  const [errorMsg, setErrorMsg] = useState<string>("");

  /* Reset cada vez que se abre */
  useEffect(() => {
    if (open) {
      setStep("date");
      setData(INITIAL);
      setErrorMsg("");
    }
  }, [open]);

  const upd = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleAllergy = (a: string) => {
    setData((d) => ({
      ...d,
      allergies: d.allergies.includes(a)
        ? d.allergies.filter((x) => x !== a)
        : [...d.allergies, a],
    }));
  };

  /* Validación por paso: permite o bloquea "Siguiente" */
  const canProceed = (): boolean => {
    switch (step) {
      case "date":
        return !!data.eventDate;
      case "party":
        return data.partySize >= 1;
      case "restrictions":
        return true;
      case "preferences":
        return true;
      case "contact":
        return (
          !!data.email.trim() &&
          /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email) &&
          !!data.phone.trim()
        );
      default:
        return true;
    }
  };

  const next = () => {
    const idx = STEPS_VISIBLE.indexOf(step as (typeof STEPS_VISIBLE)[number]);
    if (idx < 0) return;
    if (idx === STEPS_VISIBLE.length - 1) setStep("review");
    else setStep(STEPS_VISIBLE[idx + 1]);
  };

  const prev = () => {
    if (step === "review") return setStep(STEPS_VISIBLE[STEPS_VISIBLE.length - 1]);
    const idx = STEPS_VISIBLE.indexOf(step as (typeof STEPS_VISIBLE)[number]);
    if (idx > 0) setStep(STEPS_VISIBLE[idx - 1]);
  };

  const submit = async () => {
    setStep("sending");
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          guestName,
          invitationCode,
        }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        setStep("sent");
      } else {
        setErrorMsg(body.error ?? "unknown");
        setStep("error");
      }
    } catch {
      setErrorMsg("network");
      setStep("error");
    }
  };

  /* Esc cierra el flow */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const visibleIdx = STEPS_VISIBLE.indexOf(
    step as (typeof STEPS_VISIBLE)[number]
  );
  const progress =
    step === "review" || step === "sending" || step === "sent"
      ? STEPS_VISIBLE.length
      : Math.max(0, visibleIdx);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        overflow: "hidden",
        background: "#140c06",
      }}
    >
      {/* Foto atmosférica de fondo con overlay oscuro */}
      <div style={{ position: "absolute", inset: "-4%" }}>
        <Image
          src="/images/Atento_Catering-17.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", objectPosition: "50% 50%" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(20,12,6,0.7) 0%, rgba(20,12,6,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(20,12,6,0.55)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(245,240,232,0.25)",
          color: "rgba(245,240,232,0.85)",
          fontSize: 18,
          cursor: "pointer",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.85)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(20,12,6,0.55)";
        }}
      >
        ✕
      </button>

      {/* Card centrada */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px 24px",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <motion.div
          layout
          style={{
            width: "100%",
            maxWidth: 620,
            background: "rgba(255, 250, 240, 0.96)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(176, 137, 104, 0.35)",
            borderRadius: 4,
            padding: "clamp(28px, 4vw, 44px)",
            boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header con guest name + progreso */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.55em",
                textTransform: "uppercase",
                color: "rgba(94, 68, 42, 0.55)",
                margin: 0,
                fontFamily: "var(--font-work-sans, sans-serif)",
              }}
            >
              Reservar tu noche
            </p>
            <h2
              style={{
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontStyle: "italic",
                fontSize: "clamp(1.6rem, 3.2vw, 2.1rem)",
                color: "#3a2418",
                margin: "6px 0 0 0",
                lineHeight: 1.15,
              }}
            >
              {guestName}
            </h2>
            {/* Barra de progreso */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              {STEPS_VISIBLE.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 2,
                    background:
                      i < progress
                        ? "#8b6a42"
                        : i === progress
                        ? "#c9a57b"
                        : "rgba(94, 68, 42, 0.15)",
                    borderRadius: 1,
                    transition: "background 0.4s",
                  }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "date" && (
              <StepDate
                key="date"
                data={data}
                upd={upd}
                onNext={next}
                canProceed={canProceed()}
                onClose={onClose}
              />
            )}
            {step === "party" && (
              <StepParty
                key="party"
                data={data}
                upd={upd}
                onNext={next}
                onBack={prev}
                canProceed={canProceed()}
              />
            )}
            {step === "restrictions" && (
              <StepRestrictions
                key="restrictions"
                data={data}
                upd={upd}
                toggleAllergy={toggleAllergy}
                onNext={next}
                onBack={prev}
              />
            )}
            {step === "preferences" && (
              <StepPreferences
                key="preferences"
                data={data}
                upd={upd}
                onNext={next}
                onBack={prev}
              />
            )}
            {step === "contact" && (
              <StepContact
                key="contact"
                data={data}
                upd={upd}
                onNext={next}
                onBack={prev}
                canProceed={canProceed()}
              />
            )}
            {step === "review" && (
              <StepReview
                key="review"
                data={data}
                onBack={prev}
                onSubmit={submit}
              />
            )}
            {step === "sending" && <StepSending key="sending" />}
            {step === "sent" && (
              <StepSent key="sent" guestName={guestName} onClose={onClose} />
            )}
            {step === "error" && (
              <StepError
                key="error"
                errorMsg={errorMsg}
                onRetry={() => setStep("review")}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 1 — Fecha y hora
   ═══════════════════════════════════════════════════════════════════ */

function StepDate({
  data,
  upd,
  onNext,
  canProceed,
  onClose,
}: {
  data: FormData;
  upd: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onNext: () => void;
  canProceed: boolean;
  onClose: () => void;
}) {
  return (
    <StepWrap>
      <StepTitle
        question="¿Cuándo te gustaría?"
        helper="Elige la noche que tengas en mente. Antonio confirmará disponibilidad contigo."
      />
      <Field label="Fecha preferida">
        <input
          type="date"
          value={data.eventDate}
          onChange={(e) => upd("eventDate", e.target.value)}
          required
          min={new Date().toISOString().slice(0, 10)}
          style={inp()}
        />
      </Field>
      <Field label="Fecha alternativa (opcional)">
        <input
          type="date"
          value={data.alternateDate}
          onChange={(e) => upd("alternateDate", e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          style={inp()}
        />
      </Field>
      <Field label="Momento del día">
        <ChipGroup
          value={data.eventTime}
          options={[
            { v: "dinner", label: "Cena" },
            { v: "lunch", label: "Almuerzo" },
            { v: "brunch", label: "Brunch" },
            { v: "other", label: "Otro" },
          ]}
          onChange={(v) => upd("eventTime", v as FormData["eventTime"])}
        />
      </Field>
      {data.eventTime === "other" && (
        <Field label="¿Cuál?">
          <input
            type="text"
            value={data.eventTimeOther}
            onChange={(e) => upd("eventTimeOther", e.target.value)}
            placeholder="Ej: media tarde, after-party…"
            style={inp()}
          />
        </Field>
      )}
      <Actions onBack={onClose} backLabel="Cancelar" onNext={onNext} disabled={!canProceed} />
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 2 — Personas y ocasión
   ═══════════════════════════════════════════════════════════════════ */

function StepParty({
  data,
  upd,
  onNext,
  onBack,
  canProceed,
}: {
  data: FormData;
  upd: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}) {
  return (
    <StepWrap>
      <StepTitle
        question="¿Cuántos seréis?"
        helper="Y si es para algo especial, cuéntanos — afecta cómo preparamos la mesa."
      />
      <Field label="Número de personas">
        <Stepper
          value={data.partySize}
          min={1}
          max={20}
          onChange={(v) => upd("partySize", v)}
        />
      </Field>
      <Field label="La ocasión">
        <ChipGroup
          value={data.occasion}
          columns={2}
          options={[
            { v: "intimate", label: "Cena íntima" },
            { v: "birthday", label: "Cumpleaños" },
            { v: "anniversary", label: "Aniversario" },
            { v: "business", label: "Negocios" },
            { v: "reunion", label: "Reunión" },
            { v: "celebration", label: "Celebración" },
            { v: "other", label: "Otro" },
          ]}
          onChange={(v) => upd("occasion", v as FormData["occasion"])}
        />
      </Field>
      {data.occasion === "other" && (
        <Field label="Cuéntanos">
          <input
            type="text"
            value={data.occasionOther}
            onChange={(e) => upd("occasionOther", e.target.value)}
            placeholder="Ej: despedida, reencuentro…"
            style={inp()}
          />
        </Field>
      )}
      <Actions onBack={onBack} onNext={onNext} disabled={!canProceed} />
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 3 — Alergias y dieta
   ═══════════════════════════════════════════════════════════════════ */

function StepRestrictions({
  data,
  upd,
  toggleAllergy,
  onNext,
  onBack,
}: {
  data: FormData;
  upd: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  toggleAllergy: (a: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepWrap>
      <StepTitle
        question="¿Algo que debamos saber?"
        helper="Cuanto más sepamos, mejor cuidamos a cada comensal. Si hay dudas, dilo en la nota."
      />
      <Field label="Alergias (selecciona todas las que apliquen)">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {ALLERGY_OPTIONS.map((a) => {
            const active = data.allergies.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergy(a)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: active ? "#8b6a42" : "transparent",
                  color: active ? "#fff8e8" : "#3a2418",
                  border: `1px solid ${
                    active ? "#8b6a42" : "rgba(94, 68, 42, 0.28)"
                  }`,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-work-sans, sans-serif)",
                  transition: "all 0.2s",
                }}
              >
                {active ? "✓ " : ""}{a}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Dieta general">
        <ChipGroup
          value={data.diet}
          columns={2}
          options={[
            { v: "none", label: "Sin restricción" },
            { v: "vegetarian", label: "Vegetariana" },
            { v: "vegan", label: "Vegana" },
            { v: "pescatarian", label: "Pescetariana" },
            { v: "gluten-free", label: "Sin gluten" },
            { v: "halal", label: "Halal" },
            { v: "kosher", label: "Kosher" },
            { v: "other", label: "Otra" },
          ]}
          onChange={(v) => upd("diet", v as FormData["diet"])}
        />
      </Field>
      {data.diet === "other" && (
        <Field label="¿Cuál?">
          <input
            type="text"
            value={data.dietOther}
            onChange={(e) => upd("dietOther", e.target.value)}
            placeholder="Ej: sin cerdo, low-carb…"
            style={inp()}
          />
        </Field>
      )}
      <Field label="Notas adicionales (opcional)">
        <textarea
          value={data.restrictionsNotes}
          onChange={(e) => upd("restrictionsNotes", e.target.value)}
          placeholder="Ej: un invitado es vegetariano estricto, otro tiene intolerancia suave al gluten…"
          rows={3}
          style={{ ...inp(), resize: "vertical", minHeight: 80 }}
        />
      </Field>
      <Actions onBack={onBack} onNext={onNext} />
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 4 — Preferencias gastronómicas y vino
   ═══════════════════════════════════════════════════════════════════ */

function StepPreferences({
  data,
  upd,
  onNext,
  onBack,
}: {
  data: FormData;
  upd: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepWrap>
      <StepTitle
        question="¿Cómo os apetece la noche?"
        helper="Desde entregaros al criterio de Antonio hasta afinar algo específico."
      />
      <Field label="La experiencia">
        <OptionList
          value={data.experienceType}
          onChange={(v) =>
            upd("experienceType", v as FormData["experienceType"])
          }
          options={[
            {
              v: "surprise",
              label: "Sorpréndanme",
              desc: "Antonio elige el menú según la temporada.",
            },
            {
              v: "preference",
              label: "Con alguna preferencia",
              desc: "Hay algo que amamos o algo que no queremos.",
            },
            {
              v: "full-tasting",
              label: "Menú degustación completo",
              desc: "Experiencia extendida, varios pases.",
            },
            {
              v: "short-menu",
              label: "Menú corto",
              desc: "Algo ligero y memorable.",
            },
          ]}
        />
      </Field>
      {data.experienceType === "preference" && (
        <Field label="Cuéntanos qué os apetece">
          <textarea
            value={data.foodPreferences}
            onChange={(e) => upd("foodPreferences", e.target.value)}
            placeholder="Ej: nos encantan los pescados blancos; no comemos carne roja; preferimos sabores asiáticos…"
            rows={3}
            style={{ ...inp(), resize: "vertical", minHeight: 80 }}
          />
        </Field>
      )}
      <Field label="Vino">
        <OptionList
          value={data.winePreference}
          onChange={(v) =>
            upd("winePreference", v as FormData["winePreference"])
          }
          options={[
            { v: "pairing", label: "Maridaje completo", desc: "Antonio elige el vino para cada plato." },
            { v: "red", label: "Tintos", desc: "" },
            { v: "white", label: "Blancos", desc: "" },
            { v: "rose", label: "Rosados", desc: "" },
            { v: "sparkling", label: "Espumosos", desc: "" },
            { v: "none", label: "Sin alcohol", desc: "Zumos, mocktails y aguas cuidadas." },
          ]}
        />
      </Field>
      <Actions onBack={onBack} onNext={onNext} />
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 5 — Contacto
   ═══════════════════════════════════════════════════════════════════ */

function StepContact({
  data,
  upd,
  onNext,
  onBack,
  canProceed,
}: {
  data: FormData;
  upd: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}) {
  return (
    <StepWrap>
      <StepTitle
        question="¿Cómo te contactamos?"
        helper="Antonio te escribirá personalmente para cerrar detalles."
      />
      <Field label="Correo electrónico">
        <input
          type="email"
          value={data.email}
          onChange={(e) => upd("email", e.target.value)}
          placeholder="tu@correo.com"
          required
          style={inp()}
        />
      </Field>
      <Field label="Teléfono / WhatsApp">
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => upd("phone", e.target.value)}
          placeholder="+34 600 000 000"
          required
          style={inp()}
        />
      </Field>
      <Field label="Mejor horario para contactar (opcional)">
        <ChipGroup
          value={data.contactTime}
          columns={2}
          options={[
            { v: "", label: "Cuando puedas" },
            { v: "mornings", label: "Mañanas" },
            { v: "afternoons", label: "Tardes" },
            { v: "evenings", label: "Noches" },
          ]}
          onChange={(v) => upd("contactTime", v)}
        />
      </Field>
      <Field label="¿Algo más que nos quieras contar? (opcional)">
        <textarea
          value={data.additionalNotes}
          onChange={(e) => upd("additionalNotes", e.target.value)}
          placeholder="Cualquier detalle que nos ayude a hacer tu noche especial."
          rows={3}
          style={{ ...inp(), resize: "vertical", minHeight: 80 }}
        />
      </Field>
      <Actions onBack={onBack} onNext={onNext} disabled={!canProceed} nextLabel="Revisar" />
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PASO 6 — Review (resumen — sin precios)
   ═══════════════════════════════════════════════════════════════════ */

function StepReview({
  data,
  onBack,
  onSubmit,
}: {
  data: FormData;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const timeLbl =
    data.eventTime === "lunch"
      ? "Almuerzo"
      : data.eventTime === "dinner"
      ? "Cena"
      : data.eventTime === "brunch"
      ? "Brunch"
      : data.eventTimeOther || "Otro";
  const occasionMap: Record<string, string> = {
    intimate: "Cena íntima",
    birthday: "Cumpleaños",
    anniversary: "Aniversario",
    business: "Negocios",
    reunion: "Reunión",
    celebration: "Celebración",
    other: data.occasionOther || "Otro",
  };
  const dietMap: Record<string, string> = {
    none: "Sin restricción",
    vegetarian: "Vegetariana",
    vegan: "Vegana",
    pescatarian: "Pescetariana",
    "gluten-free": "Sin gluten",
    halal: "Halal",
    kosher: "Kosher",
    other: data.dietOther || "Otra",
  };
  const expMap: Record<string, string> = {
    surprise: "Sorpréndanme",
    preference: "Con preferencias",
    "full-tasting": "Degustación completa",
    "short-menu": "Menú corto",
  };
  const wineMap: Record<string, string> = {
    red: "Tintos",
    white: "Blancos",
    rose: "Rosados",
    sparkling: "Espumosos",
    pairing: "Maridaje completo",
    none: "Sin alcohol",
  };

  return (
    <StepWrap>
      <StepTitle
        question="¿Todo bien?"
        helper="Revisa antes de enviar. Antonio recibirá esto y te escribirá personalmente."
      />
      <ReviewGroup title="Fecha">
        <ReviewRow label="Preferida" value={data.eventDate} />
        {data.alternateDate && (
          <ReviewRow label="Alternativa" value={data.alternateDate} />
        )}
        <ReviewRow label="Momento" value={timeLbl} />
      </ReviewGroup>
      <ReviewGroup title="Grupo">
        <ReviewRow label="Personas" value={String(data.partySize)} />
        <ReviewRow label="Ocasión" value={occasionMap[data.occasion]} />
      </ReviewGroup>
      <ReviewGroup title="Restricciones">
        <ReviewRow
          label="Alergias"
          value={data.allergies.length ? data.allergies.join(", ") : "Ninguna"}
        />
        <ReviewRow label="Dieta" value={dietMap[data.diet]} />
        {data.restrictionsNotes && (
          <ReviewRow label="Notas" value={data.restrictionsNotes} />
        )}
      </ReviewGroup>
      <ReviewGroup title="Preferencias">
        <ReviewRow label="Experiencia" value={expMap[data.experienceType]} />
        {data.foodPreferences && (
          <ReviewRow label="Comida" value={data.foodPreferences} />
        )}
        <ReviewRow label="Vino" value={wineMap[data.winePreference]} />
      </ReviewGroup>
      <ReviewGroup title="Contacto">
        <ReviewRow label="Email" value={data.email} />
        <ReviewRow label="Teléfono" value={data.phone} />
        {data.contactTime && (
          <ReviewRow label="Horario" value={data.contactTime} />
        )}
        {data.additionalNotes && (
          <ReviewRow label="Notas" value={data.additionalNotes} />
        )}
      </ReviewGroup>

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button
          type="button"
          onClick={onBack}
          style={btnSecondary()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139, 106, 66, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          ← Volver
        </button>
        <button
          type="button"
          onClick={onSubmit}
          style={{ ...btnPrimary(), flex: 2 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3a2418")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2a1810")}
        >
          Solicitar mi mesa
        </button>
      </div>
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SENDING / SENT / ERROR
   ═══════════════════════════════════════════════════════════════════ */

function StepSending() {
  return (
    <StepWrap>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            fontSize: 11,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.7)",
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          Enviando tu carta a Antonio
        </motion.p>
      </div>
    </StepWrap>
  );
}

function StepSent({ guestName, onClose }: { guestName: string; onClose: () => void }) {
  return (
    <StepWrap>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", padding: "10px 0" }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            textTransform: "uppercase",
            color: "rgba(94, 68, 42, 0.55)",
            marginBottom: 12,
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          Tu mesa está solicitada
        </p>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontStyle: "italic",
            color: "#3a2418",
            margin: "0 0 22px 0",
            lineHeight: 1.15,
          }}
        >
          Gracias, {guestName}.
        </h2>
        <div
          style={{
            width: 48,
            height: 1,
            background: "rgba(94, 68, 42, 0.35)",
            margin: "0 auto 26px",
          }}
        />
        <p
          style={{
            fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
            lineHeight: 1.8,
            color: "rgba(58, 36, 24, 0.78)",
            fontFamily: "var(--font-work-sans, sans-serif)",
            fontWeight: 300,
            maxWidth: 440,
            margin: "0 auto 32px",
          }}
        >
          Antonio ha recibido tu carta personal. Te escribirá en los próximos minutos
          — asegúrate de tener cerca tu WhatsApp.
        </p>
        <button
          onClick={onClose}
          style={btnPrimary()}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3a2418")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2a1810")}
        >
          Volver al mundo de Atento
        </button>
      </motion.div>
    </StepWrap>
  );
}

function StepError({ errorMsg, onRetry }: { errorMsg: string; onRetry: () => void }) {
  return (
    <StepWrap>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2.2vw, 1.3rem)",
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontStyle: "italic",
            color: "#3a2418",
            marginBottom: 14,
          }}
        >
          Algo salió mal al enviar tu carta
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            color: "rgba(58, 36, 24, 0.7)",
            marginBottom: 22,
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          {errorMsg === "network"
            ? "No pudimos conectar con el servidor."
            : `Error: ${errorMsg}`}
        </p>
        <button
          onClick={onRetry}
          style={btnPrimary()}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3a2418")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2a1810")}
        >
          Reintentar
        </button>
      </div>
    </StepWrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS — UI primitives compartidos
   ═══════════════════════════════════════════════════════════════════ */

function StepWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ question, helper }: { question: string; helper?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          fontSize: "clamp(1.3rem, 2.6vw, 1.6rem)",
          color: "#3a2418",
          margin: "0 0 10px 0",
          lineHeight: 1.25,
          fontWeight: 400,
        }}
      >
        {question}
      </h3>
      {helper && (
        <p
          style={{
            fontSize: "0.9rem",
            color: "rgba(58, 36, 24, 0.6)",
            lineHeight: 1.55,
            margin: 0,
            fontFamily: "var(--font-work-sans, sans-serif)",
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.65)",
          marginBottom: 10,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Actions({
  onBack,
  onNext,
  disabled,
  backLabel = "← Atrás",
  nextLabel = "Siguiente",
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
      <button
        type="button"
        onClick={onBack}
        style={btnSecondary()}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(139, 106, 66, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        style={{
          ...btnPrimary(),
          flex: 2,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.background = "#3a2418";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#2a1810";
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
  columns = 0,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div
      style={{
        display: columns > 0 ? "grid" : "flex",
        gridTemplateColumns: columns > 0 ? `repeat(${columns}, 1fr)` : undefined,
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            style={{
              padding: "11px 16px",
              borderRadius: 999,
              background: active ? "#8b6a42" : "transparent",
              color: active ? "#fff8e8" : "#3a2418",
              border: `1px solid ${active ? "#8b6a42" : "rgba(94, 68, 42, 0.28)"}`,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-work-sans, sans-serif)",
              transition: "all 0.2s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function OptionList<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            style={{
              padding: "14px 16px",
              borderRadius: 3,
              background: active ? "rgba(139, 106, 66, 0.12)" : "transparent",
              color: "#3a2418",
              border: `1px solid ${
                active ? "#8b6a42" : "rgba(94, 68, 42, 0.22)"
              }`,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "var(--font-work-sans, sans-serif)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "#5c3f26" : "#3a2418",
              }}
            >
              {active ? "● " : "○ "}{o.label}
            </div>
            {o.desc && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(58, 36, 24, 0.65)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {o.desc}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        justifyContent: "flex-start",
      }}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        style={stepBtn(value <= min)}
      >
        −
      </button>
      <div
        style={{
          fontSize: "2rem",
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontStyle: "italic",
          color: "#3a2418",
          minWidth: 60,
          textAlign: "center",
        }}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        style={stepBtn(value >= max)}
      >
        +
      </button>
      <span
        style={{
          marginLeft: 8,
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.55)",
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        {value === 1 ? "persona" : "personas"}
      </span>
    </div>
  );
}

function ReviewGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: "1px solid rgba(94, 68, 42, 0.12)",
      }}
    >
      <p
        style={{
          fontSize: 9,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.55)",
          marginBottom: 10,
          fontFamily: "var(--font-work-sans, sans-serif)",
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(94, 68, 42, 0.55)",
          fontFamily: "var(--font-work-sans, sans-serif)",
          minWidth: 90,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color: "#3a2418",
          fontFamily: "var(--font-work-sans, sans-serif)",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function inp(): React.CSSProperties {
  return {
    width: "100%",
    background: "rgba(255, 250, 240, 0.7)",
    border: "1px solid rgba(94, 68, 42, 0.22)",
    borderRadius: 3,
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: "var(--font-work-sans, sans-serif)",
    color: "#3a2418",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
  };
}

function btnPrimary(): React.CSSProperties {
  return {
    flex: 1,
    background: "#2a1810",
    color: "#f5ebd6",
    border: "1px solid rgba(201, 169, 110, 0.35)",
    padding: "14px",
    fontSize: 11,
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-work-sans, sans-serif)",
    transition: "background 0.3s",
  };
}

function btnSecondary(): React.CSSProperties {
  return {
    flex: 1,
    background: "transparent",
    color: "#3a2418",
    border: "1px solid rgba(94, 68, 42, 0.3)",
    padding: "14px",
    fontSize: 10,
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-work-sans, sans-serif)",
    transition: "all 0.2s",
  };
}

function stepBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid rgba(94, 68, 42, 0.3)",
    background: "transparent",
    color: "#3a2418",
    fontSize: 22,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.3 : 1,
    fontFamily: "var(--font-work-sans, sans-serif)",
    transition: "all 0.2s",
  };
}
