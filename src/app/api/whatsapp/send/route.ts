import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Este endpoint está deprecado. Usa /api/notifications/match-update y /api/notifications/welcome-ficha para envío automático.",
    },
    { status: 501 },
  );
}
