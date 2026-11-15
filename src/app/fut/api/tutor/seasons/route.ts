import { NextResponse } from "next/server";
import {
  deleteTutorSeason,
  getTutorChild,
  listTutorSeasons,
  reorderTutorSeasons,
  upsertTutorSeason,
} from "@/lib/tutor-family";
import {
  getSeasonClaimMapForChild,
  syncSeasonClaimForLinkedChild,
} from "@/lib/tutor-season-claims";
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
    const claims = await getSeasonClaimMapForChild(admin, child.id);
    return NextResponse.json({ seasons, claims });
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
    ordered_ids?: string[];
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

    if (body.action === "reorder") {
      const seasons = await reorderTutorSeasons(
        admin,
        child,
        Array.isArray(body.ordered_ids) ? body.ordered_ids.map(String) : [],
      );
      return NextResponse.json({ ok: true, seasons });
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
      let claim = null;
      try {
        claim = await syncSeasonClaimForLinkedChild(admin, child, row);
      } catch {
        // El torneo ya quedó guardado; la propuesta a academia es best-effort.
      }
      return NextResponse.json({
        ok: true,
        season: row,
        claim,
        proposed_to_academy: Boolean(claim),
      });
    }

    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar.";
    const status = message.includes("membresía") ? 402 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
