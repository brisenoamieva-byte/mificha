import { NextResponse } from "next/server";
import { claimNui, normalizeNui, releaseNui } from "@/lib/player-nui";
import {
  ensurePlayerPublicCodes,
  normalizePublicCode,
  readPlayerPublicCodeMap,
} from "@/lib/public-player-code";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    player_id?: string;
    nui?: string | null;
  };

  const playerId = String(body.player_id ?? "").trim();
  if (!playerId) {
    return NextResponse.json({ error: "player_id es obligatorio." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: player, error: playerError } = await admin
    .from("players")
    .select("id, academy_id, nui, academies!inner(owner_id)")
    .eq("id", playerId)
    .maybeSingle();

  if (playerError || !player) {
    return NextResponse.json({ error: "Jugador no encontrado." }, { status: 404 });
  }

  const academyJoin = player.academies as
    | { owner_id?: string }
    | { owner_id?: string }[]
    | null;
  const ownerId = Array.isArray(academyJoin)
    ? academyJoin[0]?.owner_id
    : academyJoin?.owner_id;

  if (ownerId !== user.id) {
    const { data: membership } = await admin
      .from("academy_members")
      .select("id")
      .eq("academy_id", player.academy_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
  }

  const previousNui = normalizeNui(
    (player as { nui?: string | null }).nui ?? null,
  );
  const nextRaw = body.nui == null ? "" : String(body.nui);

  try {
    const codes = await ensurePlayerPublicCodes(admin, [playerId]);
    const map = await readPlayerPublicCodeMap(admin);
    const publicCode =
      normalizePublicCode(codes[playerId] ?? map[playerId] ?? null) ?? null;

    if (!nextRaw.trim()) {
      await releaseNui(admin, { nui: previousNui, kind: "player", id: playerId });
      const { error: clearError } = await admin
        .from("players")
        .update({ nui: null })
        .eq("id", playerId);
      if (clearError) throw new Error(clearError.message);
      return NextResponse.json({ ok: true, nui: null, public_code: publicCode });
    }

    const claimed = await claimNui(admin, {
      nui: nextRaw,
      previousNui,
      publicCode,
      kind: "player",
      id: playerId,
    });

    const { error: updateError } = await admin
      .from("players")
      .update({ nui: claimed })
      .eq("id", playerId);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ ok: true, nui: claimed, public_code: publicCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se guardó el NUI.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
