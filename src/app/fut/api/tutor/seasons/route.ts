import { NextResponse } from "next/server";
import {
  deleteTutorSeason,
  getTutorChild,
  listTutorSeasons,
  upsertTutorSeason,
} from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function requireUser(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const childId = new URL(request.url).searchParams.get("child_id") ?? "";
  try {
    const admin = createSupabaseAdminClient();
    const child = await getTutorChild(admin, user.id, childId);
    if (!child) {
      return NextResponse.json({ error: "No encontramos a ese jugador." }, { status: 404 });
    }
    const seasons = await listTutorSeasons(admin, child);
    return NextResponse.json({ seasons });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    child_id?: string;
    season_id?: string;
    tournament_name?: string;
    season_label?: string;
    team_name?: string | null;
    matches?: number;
    goals?: number;
    assists?: number;
    minutes?: number;
    notes?: string | null;
  };

  try {
    const admin = createSupabaseAdminClient();
    const child = await getTutorChild(admin, user.id, String(body.child_id ?? ""));
    if (!child) {
      return NextResponse.json({ error: "No encontramos a ese jugador." }, { status: 404 });
    }

    if (body.action === "delete") {
      const result = await deleteTutorSeason(
        admin,
        child,
        String(body.season_id ?? ""),
      );
      return NextResponse.json(result);
    }

    if (body.action === "save") {
      const row = await upsertTutorSeason(
        admin,
        child,
        {
          tournament_name: String(body.tournament_name ?? ""),
          season_label: String(body.season_label ?? ""),
          team_name: body.team_name,
          matches: body.matches,
          goals: body.goals,
          assists: body.assists,
          minutes: body.minutes,
          notes: body.notes,
        },
        body.season_id ? String(body.season_id) : null,
      );
      return NextResponse.json({ ok: true, season: row });
    }

    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    const status = message.includes("membresía") ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
