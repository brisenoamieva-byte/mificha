import { NextResponse } from "next/server";
import {
  createActaSession,
  loadActaBundle,
  publicActaSession,
} from "@/lib/match-acta-server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function assertPlatformAdmin(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email) || !user) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }

  return { admin: createSupabaseAdminClient(), user };
}

/** GET ?home_match_id= — estado de sesión para panel interno. */
export async function GET(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const homeMatchId = new URL(request.url).searchParams.get("home_match_id")?.trim();
  if (!homeMatchId) {
    return NextResponse.json(
      { error: "home_match_id es obligatorio." },
      { status: 400 },
    );
  }

  const { data: session, error } = await auth.admin
    .from("match_acta_sessions")
    .select("*")
    .eq("home_match_id", homeMatchId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ session: null });
  }

  const bundle = await loadActaBundle(auth.admin, session.id);
  return NextResponse.json({
    session: publicActaSession(bundle!.session),
    lineups: bundle!.lineups,
    events: bundle!.events,
    signatures: bundle!.signatures,
  });
}

interface CreateBody {
  home_match_id?: string;
  away_academy_id?: string | null;
  away_match_id?: string | null;
}

/** POST — crea sesión + token árbitro (solo se muestra una vez). */
export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as CreateBody;
  const homeMatchId = body.home_match_id?.trim();

  if (!homeMatchId) {
    return NextResponse.json(
      { error: "home_match_id es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const created = await createActaSession(auth.admin, {
      homeMatchId,
      awayAcademyId: body.away_academy_id ?? null,
      awayMatchId: body.away_match_id ?? null,
      createdByEmail: auth.user?.email ?? null,
    });

    return NextResponse.json({
      session: publicActaSession(created.session),
      referee_token: created.refereeToken,
      referee_url: created.refereeUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la sesión.";
    const status = message.includes("Ya existe") || message.includes("Solo se puede")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
