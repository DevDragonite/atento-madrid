import { NextResponse } from "next/server";
import { validateCode } from "@/lib/invitations";

export async function POST(req: Request) {
  let body: { code?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "not-found" },
      { status: 400 }
    );
  }

  const code = typeof body.code === "string" ? body.code : "";
  const result = validateCode(code);

  /* Status 200 en ambos casos — es un error de validación de negocio,
     no de infraestructura. El cliente actúa según `result.ok`. */
  return NextResponse.json(result);
}
