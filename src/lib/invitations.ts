import "server-only";

/* ═══════════════════════════════════════════════════════════════════
   INVITACIONES DE ATENTO — Gestión server-side
   Nunca importar este módulo desde un Client Component; los códigos
   acabarían en el bundle del cliente visibles en DevTools.
   La validación se expone únicamente vía /api/invite (POST).
   ═══════════════════════════════════════════════════════════════════ */

export interface Invitation {
  /** Código único que Antonio le da al cliente (ej. "ATN-MARIA-0517") */
  code: string;
  /** Nombre del invitado — se pre-rellena en la experiencia */
  guestName: string;
  /** Fecha del evento en ISO (YYYY-MM-DD) */
  eventDate: string;
  /** Fecha a partir de la cual el código deja de valer (ISO). Típicamente eventDate + 1 día. */
  expiryDate: string;
  /** Datos opcionales para uso futuro (pre-rellenar formulario de reserva, personalizar copy, etc.) */
  partySize?: number;
  notes?: string;
}

/**
 * Handle/URL de Instagram de Atento al que mandar a los clientes sin código.
 * TODO(Antonio): confirmar el usuario real — ahora mismo es placeholder.
 */
export const INSTAGRAM_URL = "https://instagram.com/atento.madrid";
export const INSTAGRAM_HANDLE = "@atento.madrid";

/**
 * Lista maestra de invitaciones.
 * TODO: migrar a base de datos (Supabase) cuando Antonio quiera gestionar
 * los códigos él mismo desde un panel. Por ahora gestión manual — editar
 * este array y redeploy.
 */
const INVITATIONS: Invitation[] = [
  /* Código de demostración permanente — para que el user pueda mostrárselo
     a Antonio sin problemas de expiración. Quitar antes de producción real. */
  {
    code: "ATENTO-DEMO",
    guestName: "Cipher",
    eventDate: "2099-12-31",
    expiryDate: "2099-12-31",
  },
  /* Antonio añadirá aquí los códigos reales que le vaya dando a cada cliente.
     Plantilla:
     {
       code: "ATN-MARIA-0517",
       guestName: "María",
       eventDate: "2026-05-17",
       expiryDate: "2026-05-18",  // un día después
     },
  */
];

export type InviteValidationResult =
  | { ok: true; guestName: string; eventDate: string }
  | { ok: false; reason: "not-found" | "expired" | "empty" };

/** Valida un código y devuelve la info del invitado si está vigente. */
export function validateCode(raw: string): InviteValidationResult {
  const code = (raw ?? "").trim().toUpperCase();
  if (!code) return { ok: false, reason: "empty" };

  const inv = INVITATIONS.find((i) => i.code.toUpperCase() === code);
  if (!inv) return { ok: false, reason: "not-found" };

  /* Expiración: medianoche del día de expiryDate (zona servidor). */
  const now = Date.now();
  const expiry = new Date(inv.expiryDate + "T23:59:59").getTime();
  if (now > expiry) return { ok: false, reason: "expired" };

  return { ok: true, guestName: inv.guestName, eventDate: inv.eventDate };
}
