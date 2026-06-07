import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const SEED_ACADEMY_SLUG = "academia-nortenios";

const PLAYERS = [
  {
    first_name: "Santiago",
    last_name: "Hernández",
    birth_date: "2011-03-14",
    position: "forward" as const,
    dominant_foot: "right" as const,
    passport_score: 78,
    photo_url: "https://placehold.co/400x500/1B4F8C/ffffff?text=SH",
  },
  {
    first_name: "Diego",
    last_name: "Ramírez",
    birth_date: "2012-07-22",
    position: "midfielder" as const,
    dominant_foot: "both" as const,
    passport_score: 71,
    photo_url: "https://placehold.co/400x500/0F2D52/ffffff?text=DR",
  },
  {
    first_name: "Emiliano",
    last_name: "Torres",
    birth_date: "2010-11-05",
    position: "defender" as const,
    dominant_foot: "left" as const,
    passport_score: 69,
    photo_url: "https://placehold.co/400x500/334155/ffffff?text=ET",
  },
  {
    first_name: "Mateo",
    last_name: "Vázquez",
    birth_date: "2013-01-18",
    position: "goalkeeper" as const,
    dominant_foot: "right" as const,
    passport_score: 74,
    photo_url: "https://placehold.co/400x500/15803d/ffffff?text=MV",
  },
  {
    first_name: "Sebastián",
    last_name: "Morales",
    birth_date: "2011-09-30",
    position: "forward" as const,
    dominant_foot: "right" as const,
    passport_score: 82,
    photo_url: "https://placehold.co/400x500/b45309/ffffff?text=SM",
  },
];

const MATCHES = [
  {
    opponent: "Rayados Jr",
    match_date: "2025-09-12",
    result: "win" as const,
    goals_for: 3,
    goals_against: 1,
    stats: [
      { goals: 2, assists: 0, minutes_played: 70, yellow_cards: 0, red_cards: 0 },
      { goals: 0, assists: 1, minutes_played: 65, yellow_cards: 1, red_cards: 0 },
      { goals: 0, assists: 0, minutes_played: 80, yellow_cards: 0, red_cards: 0 },
      { goals: 0, assists: 0, minutes_played: 80, yellow_cards: 0, red_cards: 0 },
      { goals: 1, assists: 1, minutes_played: 72, yellow_cards: 0, red_cards: 0 },
    ],
  },
  {
    opponent: "Pumas Sur",
    match_date: "2025-10-04",
    result: "draw" as const,
    goals_for: 2,
    goals_against: 2,
    stats: [
      { goals: 1, assists: 0, minutes_played: 68, yellow_cards: 0, red_cards: 0 },
      { goals: 0, assists: 1, minutes_played: 74, yellow_cards: 0, red_cards: 0 },
      { goals: 0, assists: 0, minutes_played: 80, yellow_cards: 1, red_cards: 0 },
      { goals: 0, assists: 0, minutes_played: 80, yellow_cards: 0, red_cards: 0 },
      { goals: 1, assists: 0, minutes_played: 66, yellow_cards: 0, red_cards: 0 },
    ],
  },
];

function buildSlug(firstName: string, lastName: string) {
  const base = `${firstName} ${lastName}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-seed`;
}

function normalizeOwnerId(raw: string | undefined) {
  if (!raw) return null;
  return raw.trim().replace(/^<|>$/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message) return message;
  }
  return "Error al ejecutar seed.";
}

function isSeedAuthorized(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const adminKey = request.headers.get("x-seed-admin-key");
  const expectedKey = process.env.SEED_ADMIN_KEY;

  return Boolean(expectedKey && adminKey && adminKey === expectedKey);
}

export async function POST(request: Request) {
  if (!isSeedAuthorized(request)) {
    return NextResponse.json(
      { error: "No autorizado. Usa x-seed-admin-key en desarrollo." },
      { status: 403 },
    );
  }

  const ownerId = normalizeOwnerId(process.env.SEED_OWNER_ID);
  if (!ownerId) {
    return NextResponse.json(
      { error: "Configura SEED_OWNER_ID en .env.local." },
      { status: 500 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    await supabase.from("academies").delete().eq("slug", SEED_ACADEMY_SLUG);

    const { data: academy, error: academyError } = await supabase
      .from("academies")
      .insert({
        name: "Academia Norteños Querétaro",
        slug: SEED_ACADEMY_SLUG,
        city: "Querétaro",
        state: "Querétaro",
        description:
          "Academia formativa en Querétaro con fichas técnicas digitales verificadas.",
        owner_id: ownerId,
        is_public: true,
        is_certified: true,
        primary_color: "#1B4F8C",
        phone: "4421234567",
      })
      .select("*")
      .single();

    if (academyError || !academy) {
      throw academyError ?? new Error("No se pudo crear la academia.");
    }

    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .insert({
        academy_id: academy.id,
        name: "2025-2026",
        start_date: "2025-08-01",
        end_date: "2026-07-31",
        is_active: true,
      })
      .select("*")
      .single();

    if (seasonError || !season) {
      throw seasonError ?? new Error("No se pudo crear la temporada.");
    }

    const consentTimestamp = new Date().toISOString();

    const playerRows = PLAYERS.map((player, index) => ({
      ...player,
      slug: buildSlug(player.first_name, player.last_name),
      academy_id: academy.id,
      is_public: true,
      is_discoverable: index < 3,
      public_consent_at: consentTimestamp,
    }));

    const { data: players, error: playersError } = await supabase
      .from("players")
      .insert(playerRows)
      .select("*");

    if (playersError || !players) {
      throw playersError ?? new Error("No se pudieron crear los jugadores.");
    }

    const createdMatches = [];

    for (const matchTemplate of MATCHES) {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          academy_id: academy.id,
          season_id: season.id,
          opponent: matchTemplate.opponent,
          match_date: matchTemplate.match_date,
          result: matchTemplate.result,
          goals_for: matchTemplate.goals_for,
          goals_against: matchTemplate.goals_against,
        })
        .select("*")
        .single();

      if (matchError || !match) {
        throw matchError ?? new Error("No se pudo crear el partido.");
      }

      const matchStats = players.map((player, index) => ({
        match_id: match.id,
        player_id: player.id,
        captured_by: "coach" as const,
        ...matchTemplate.stats[index],
      }));

      const { error: statsError } = await supabase
        .from("match_stats")
        .insert(matchStats);

      if (statsError) throw statsError;

      createdMatches.push(match);
    }

    const { data: seasonStats } = await supabase
      .from("player_season_stats")
      .select("*")
      .eq("season_id", season.id);

    return NextResponse.json({
      academy,
      season,
      players,
      matches: createdMatches,
      player_season_stats: seasonStats ?? [],
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
