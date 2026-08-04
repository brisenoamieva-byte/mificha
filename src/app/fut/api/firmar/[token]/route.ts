import { NextResponse } from "next/server";
import { ACTA_EVENT_LABELS, computeScoreFromEvents } from "@/lib/match-acta";
import {
  findSessionBySignToken,
  loadActaBundle,
  publicActaSession,
  recordDelegateSignature,
} from "@/lib/match-acta-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface SignBody {
  decision?: "accept" | "object";
  signer_name?: string;
  signer_title?: string | null;
  objection_note?: string | null;
}

function buildSummary(
  events: Awaited<ReturnType<typeof loadActaBundle>> extends infer T
    ? T extends { events: infer E }
      ? E
      : never
    : never,
  lineups: NonNullable<Awaited<ReturnType<typeof loadActaBundle>>>["lineups"],
) {
  const active = events.filter((event) => !event.voided_at);
  return active.map((event) => {
    const lineup = lineups.find((row) => row.id === event.lineup_id);
    return {
      minute: event.minute,
      stoppage: event.stoppage,
      side: event.side,
      type: event.event_type,
      label: ACTA_EVENT_LABELS[event.event_type],
      player: lineup?.display_name ?? "—",
      jersey: lineup?.jersey_number ?? null,
    };
  });
}

/** Resumen para el delegado. */
export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;

  try {
    const admin = createSupabaseAdminClient();
    const found = await findSessionBySignToken(admin, token.trim());
    if (!found) {
      return NextResponse.json({ error: "Link de firma no válido." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link de firma expiró." }, { status: 410 });
    }

    const bundle = await loadActaBundle(admin, found.session.id);
    if (!bundle) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });
    }

    const score = {
      home: bundle.session.score_home ?? computeScoreFromEvents(bundle.events).home,
      away: bundle.session.score_away ?? computeScoreFromEvents(bundle.events).away,
    };

    return NextResponse.json({
      side: found.side,
      already_signed: found.alreadySigned,
      session: publicActaSession(bundle.session),
      score,
      summary: buildSummary(bundle.events, bundle.lineups),
      referee_name: bundle.session.referee_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Aceptar u objetar el acta. */
export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = (await request.json()) as SignBody;

  if (body.decision !== "accept" && body.decision !== "object") {
    return NextResponse.json(
      { error: "decision debe ser accept u object." },
      { status: 400 },
    );
  }
  if (!body.signer_name?.trim()) {
    return NextResponse.json({ error: "signer_name es obligatorio." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const found = await findSessionBySignToken(admin, token.trim());
    if (!found) {
      return NextResponse.json({ error: "Link de firma no válido." }, { status: 404 });
    }
    if (found.expired) {
      return NextResponse.json({ error: "El link de firma expiró." }, { status: 410 });
    }
    if (found.alreadySigned) {
      return NextResponse.json({ error: "Este lado ya firmó." }, { status: 400 });
    }

    const result = await recordDelegateSignature(admin, {
      session: found.session,
      side: found.side,
      decision: body.decision,
      signerName: body.signer_name,
      signerTitle: body.signer_title,
      objectionNote: body.objection_note,
      request,
    });

    return NextResponse.json({
      session: publicActaSession(result.session),
      published: result.published,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo firmar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
