import { NextResponse } from "next/server";
import {
  findSessionByRefereeToken,
  moveActaToReview,
  publicActaSession,
  startCapturingIfReady,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface StatusBody {
  status?: "capturing" | "review";
}

/** Transiciones: lineup → capturing, capturing → review. */
export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = (await request.json()) as StatusBody;

  if (body.status !== "capturing" && body.status !== "review") {
    return NextResponse.json(
      { error: "status debe ser capturing o review." },
      { status: 400 },
    );
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

    const session =
      body.status === "capturing"
        ? await startCapturingIfReady(admin, found.session.id)
        : await moveActaToReview(admin, found.session);

    return NextResponse.json({ session: publicActaSession(session) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cambiar estado.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
