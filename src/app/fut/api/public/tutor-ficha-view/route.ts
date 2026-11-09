import { NextResponse } from "next/server";
import { getTutorChildByShareToken } from "@/lib/tutor-family";
import { recordTutorFichaView } from "@/lib/tutor-ficha-views";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface Body {
  token?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "token es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const child = await getTutorChildByShareToken(admin, token);
    if (!child) {
      return NextResponse.json({ recorded: false }, { status: 200 });
    }

    const result = await recordTutorFichaView(
      admin,
      child.id,
      request,
      child.public_code || child.share_token,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
