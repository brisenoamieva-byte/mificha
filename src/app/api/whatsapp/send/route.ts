import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Envío automático deshabilitado. Usa los botones de WhatsApp (wa.me) en Plantel y Partidos.",
    },
    { status: 501 },
  );
}
