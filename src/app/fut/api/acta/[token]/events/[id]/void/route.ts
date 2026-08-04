import { NextResponse } from "next/server";
import {
  findSessionByRefereeToken,
  voidActaEvent,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string; id: string }>;
}

interface VoidBody {
  reason?: string;
}

export async function POST(request: Request, context: RouteContext) {
  const { token, id } = await context.params;
  const body = (await request.json()) as VoidBody;

  if (!body.reason?.trim()) {
    return NextResponse.json({ error: "reason es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const found = await findSessionByRefereeToken(admin, token.trim());
    if (!found) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link del árbitro expiró." }, { status: 410 });
    }

    const event = await voidActaEvent(admin, found.session, id, body.reason);
    return NextResponse.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo anular.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
