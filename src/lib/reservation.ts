import "server-only";

/* ═══════════════════════════════════════════════════════════════════
   RESERVA — Tipos, cotización y notificación a Antonio
   La cotización NUNCA se devuelve al cliente. Solo se envía a Antonio
   por Telegram junto con el resto de datos.
   ═══════════════════════════════════════════════════════════════════ */

export interface ReservationData {
  guestName: string;
  invitationCode?: string;

  /* Fecha */
  eventDate: string;           // ISO YYYY-MM-DD
  alternateDate?: string;      // Segunda opción opcional
  eventTime: "lunch" | "dinner" | "brunch" | "other";
  eventTimeOther?: string;

  /* Grupo */
  partySize: number;
  occasion:
    | "intimate"
    | "birthday"
    | "anniversary"
    | "business"
    | "reunion"
    | "celebration"
    | "other";
  occasionOther?: string;

  /* Restricciones */
  allergies: string[];         // tags múltiples
  diet:
    | "none"
    | "vegetarian"
    | "vegan"
    | "pescatarian"
    | "gluten-free"
    | "halal"
    | "kosher"
    | "other";
  dietOther?: string;
  restrictionsNotes?: string;

  /* Preferencias */
  experienceType:
    | "surprise"           // sorpréndanme, Antonio decide
    | "preference"         // tiene preferencias específicas
    | "full-tasting"       // menú degustación completo
    | "short-menu";        // menú corto
  foodPreferences?: string;
  winePreference:
    | "red"
    | "white"
    | "rose"
    | "sparkling"
    | "pairing"            // maridaje completo (premium)
    | "none";              // sin alcohol

  /* Contacto */
  email: string;
  phone: string;
  contactTime?: string;

  /* Texto libre final */
  additionalNotes?: string;
}

/* ── Reglas de cotización (provisionales — Antonio definirá las finales) ── */
const BASE_PER_PERSON = 45;
const WINE_PAIRING_PREMIUM = 15;   // por persona si eligen maridaje completo
const TASTING_MENU_PREMIUM = 20;   // por persona si eligen degustación extendida
const SMALL_GROUP_SURCHARGE = 30;  // menos de 4 personas
const LARGE_GROUP_DISCOUNT = 5;    // por persona si >= 8 personas

export interface QuoteBreakdown {
  base: number;
  winePairing: number;
  tastingMenu: number;
  smallGroupSurcharge: number;
  largeGroupDiscount: number;
  total: number;
  perPerson: number;
}

export function calculateQuote(d: ReservationData): QuoteBreakdown {
  const base = BASE_PER_PERSON * d.partySize;
  const winePairing =
    d.winePreference === "pairing" ? WINE_PAIRING_PREMIUM * d.partySize : 0;
  const tastingMenu =
    d.experienceType === "full-tasting" ? TASTING_MENU_PREMIUM * d.partySize : 0;
  const smallGroupSurcharge = d.partySize < 4 ? SMALL_GROUP_SURCHARGE : 0;
  const largeGroupDiscount =
    d.partySize >= 8 ? LARGE_GROUP_DISCOUNT * d.partySize : 0;

  const total =
    base +
    winePairing +
    tastingMenu +
    smallGroupSurcharge -
    largeGroupDiscount;

  return {
    base,
    winePairing,
    tastingMenu,
    smallGroupSurcharge,
    largeGroupDiscount,
    total,
    perPerson: Math.round((total / d.partySize) * 100) / 100,
  };
}

/* ── Helpers de copy legible para el Telegram ── */
function timeLabel(t: ReservationData["eventTime"], other?: string): string {
  return t === "lunch"
    ? "Almuerzo"
    : t === "dinner"
    ? "Cena"
    : t === "brunch"
    ? "Brunch"
    : other ?? "Otro";
}

function occasionLabel(
  o: ReservationData["occasion"],
  other?: string
): string {
  const map: Record<string, string> = {
    intimate: "Cena íntima",
    birthday: "Cumpleaños",
    anniversary: "Aniversario",
    business: "Negocio",
    reunion: "Reunión de amigos",
    celebration: "Celebración",
    other: other ?? "Otro",
  };
  return map[o] ?? o;
}

function dietLabel(d: ReservationData["diet"], other?: string): string {
  const map: Record<string, string> = {
    none: "Sin restricción",
    vegetarian: "Vegetariana",
    vegan: "Vegana",
    pescatarian: "Pescetariana",
    "gluten-free": "Sin gluten",
    halal: "Halal",
    kosher: "Kosher",
    other: other ?? "Otra",
  };
  return map[d] ?? d;
}

function experienceLabel(
  e: ReservationData["experienceType"],
  prefs?: string
): string {
  const map: Record<string, string> = {
    surprise: "Sorpréndanme — Antonio y Mila deciden",
    preference: prefs ? `Preferencias: ${prefs}` : "Con preferencias",
    "full-tasting": "Menú degustación completo",
    "short-menu": "Menú corto",
  };
  return map[e] ?? e;
}

function wineLabel(w: ReservationData["winePreference"]): string {
  const map: Record<string, string> = {
    red: "Tintos",
    white: "Blancos",
    rose: "Rosados",
    sparkling: "Espumosos",
    pairing: "Maridaje completo de la casa",
    none: "Sin alcohol",
  };
  return map[w] ?? w;
}

/* ── Mensaje Telegram (Markdown) ── */
export function formatTelegramMessage(
  d: ReservationData,
  q: QuoteBreakdown
): string {
  const lines: string[] = [];
  lines.push(`🍽️ *Nueva solicitud de Atento*`);
  lines.push("");
  lines.push(
    `👤 *${d.guestName}*${d.invitationCode ? ` · código \`${d.invitationCode}\`` : ""}`
  );
  lines.push(
    `📅 ${d.eventDate}${d.alternateDate ? ` (alt: ${d.alternateDate})` : ""}`
  );
  lines.push(`🕐 ${timeLabel(d.eventTime, d.eventTimeOther)}`);
  lines.push(
    `👥 ${d.partySize} personas · ${occasionLabel(d.occasion, d.occasionOther)}`
  );
  lines.push("");

  if (d.allergies.length) {
    lines.push(`🚫 Alergias: ${d.allergies.join(", ")}`);
  } else {
    lines.push(`🚫 Sin alergias declaradas`);
  }
  lines.push(`🥗 Dieta: ${dietLabel(d.diet, d.dietOther)}`);
  if (d.restrictionsNotes?.trim()) {
    lines.push(`📝 ${d.restrictionsNotes.trim()}`);
  }
  lines.push("");

  lines.push(`🎯 ${experienceLabel(d.experienceType, d.foodPreferences)}`);
  lines.push(`🍷 Vino: ${wineLabel(d.winePreference)}`);
  lines.push("");

  lines.push(`📧 ${d.email}`);
  lines.push(`📞 ${d.phone}${d.contactTime ? ` · prefiere ${d.contactTime}` : ""}`);
  if (d.additionalNotes?.trim()) {
    lines.push("");
    lines.push(`💬 ${d.additionalNotes.trim()}`);
  }
  lines.push("");

  /* Desglose de cotización — solo para ti, Antonio */
  lines.push(`💰 *Cotización propuesta: $${q.total}* ($${q.perPerson} p.p.)`);
  const details: string[] = [`base $${q.base}`];
  if (q.winePairing) details.push(`+maridaje $${q.winePairing}`);
  if (q.tastingMenu) details.push(`+degustación $${q.tastingMenu}`);
  if (q.smallGroupSurcharge) details.push(`+grupo pequeño $${q.smallGroupSurcharge}`);
  if (q.largeGroupDiscount)
    details.push(`-grupo grande $${q.largeGroupDiscount}`);
  lines.push(`_${details.join(" · ")}_`);

  return lines.join("\n");
}

/* ── Envío a Telegram (stub si no hay credenciales) ── */
export async function notifyAntonio(
  data: ReservationData,
  quote: QuoteBreakdown
): Promise<{ delivered: boolean; message: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const message = formatTelegramMessage(data, quote);

  if (!token || !chatId) {
    console.log(
      "\n[RESERVATION] Telegram no configurado — mensaje que se enviaría:\n" +
        "─".repeat(60) +
        "\n" +
        message +
        "\n" +
        "─".repeat(60) +
        "\n"
    );
    return { delivered: false, message };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );
    return { delivered: res.ok, message };
  } catch (e) {
    console.error("[RESERVATION] Error enviando Telegram:", e);
    return { delivered: false, message };
  }
}
