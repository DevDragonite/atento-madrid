import { NextResponse } from "next/server";
import {
  calculateQuote,
  notifyAntonio,
  type ReservationData,
} from "@/lib/reservation";

/* Validación mínima — los campos que Antonio necesita sí o sí
   para poder responder. El resto son opcionales / enriquecen. */
function validate(d: Partial<ReservationData>): string | null {
  if (!d.guestName?.trim()) return "guestName";
  if (!d.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))
    return "email";
  if (!d.phone?.trim()) return "phone";
  if (!d.eventDate?.trim()) return "eventDate";
  if (
    typeof d.partySize !== "number" ||
    d.partySize < 1 ||
    d.partySize > 30
  )
    return "partySize";
  return null;
}

export async function POST(req: Request) {
  let data: ReservationData;
  try {
    data = (await req.json()) as ReservationData;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid-json" },
      { status: 400 }
    );
  }

  const missing = validate(data);
  if (missing) {
    return NextResponse.json(
      { ok: false, error: "missing-field", field: missing },
      { status: 400 }
    );
  }

  const quote = calculateQuote(data);
  const { delivered } = await notifyAntonio(data, quote);

  /* IMPORTANTE: nunca devolvemos la cotización al cliente. */
  return NextResponse.json({
    ok: true,
    telegramDelivered: delivered,
  });
}
