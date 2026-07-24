import { NextResponse } from "next/server";
import {
  buildVisitorKey,
  getProfileViewDedupSince,
} from "@/lib/profile-view-tracking";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface ProfileViewBody {
  slug?: string;
}

export async function POST(request: Request) {
  let body: ProfileViewBody;

  try {
    body = (await request.json()) as ProfileViewBody;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "slug es obligatorio." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: player, error: playerError } = await admin
    .from("players")
    .select("id, academy_id, is_public, public_consent_at")
    .eq("slug", slug)
    .maybeSingle();

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 });
  }

  if (!player?.is_public || !player.public_consent_at) {
    return NextResponse.json({ recorded: false }, { status: 200 });
  }

  const visitorKey = buildVisitorKey(request, slug);
  const dedupSince = getProfileViewDedupSince();

  const { data: recentView } = await admin
    .from("player_profile_views")
    .select("id")
    .eq("player_id", player.id)
    .eq("visitor_key", visitorKey)
    .gte("viewed_at", dedupSince)
    .maybeSingle();

  if (recentView?.id) {
    return NextResponse.json({ recorded: false, deduped: true });
  }

  const { error: insertError } = await admin.from("player_profile_views").insert({
    player_id: player.id,
    academy_id: player.academy_id,
    visitor_key: visitorKey,
  });

  if (insertError) {
    if (insertError.code === "42P01") {
      return NextResponse.json({ recorded: false, migrationPending: true });
    }

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ recorded: true });
}
