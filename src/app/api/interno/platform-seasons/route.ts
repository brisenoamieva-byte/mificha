import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function assertPlatformAdmin(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }

  return { admin: createSupabaseAdminClient() };
}

function slugifySeasonName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function GET(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const { data: platformSeasons, error } = await auth.admin
    .from("platform_seasons")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: assignmentCounts } = await auth.admin
    .from("seasons")
    .select("platform_season_id")
    .not("platform_season_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of assignmentCounts ?? []) {
    if (!row.platform_season_id) continue;
    counts.set(row.platform_season_id, (counts.get(row.platform_season_id) ?? 0) + 1);
  }

  return NextResponse.json({
    platformSeasons: (platformSeasons ?? []).map((season) => ({
      ...season,
      assigned_academies: counts.get(season.id) ?? 0,
    })),
  });
}

interface PlatformSeasonBody {
  name?: string;
  region?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  platform_season_id?: string;
  assign_public?: boolean;
  academy_ids?: string[];
}

export async function POST(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as PlatformSeasonBody;

  if (body.platform_season_id && (body.assign_public || body.academy_ids?.length)) {
    return assignPlatformSeason(auth.admin, body);
  }

  const name = body.name?.trim();
  const startDate = body.start_date?.trim();
  const endDate = body.end_date?.trim();

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "name, start_date y end_date son obligatorios." },
      { status: 400 },
    );
  }

  const baseSlug = slugifySeasonName(name) || "temporada";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data: existing } = await auth.admin
      .from("platform_seasons")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  if (body.is_active !== false) {
    await auth.admin.from("platform_seasons").update({ is_active: false }).eq("is_active", true);
  }

  const { data, error } = await auth.admin
    .from("platform_seasons")
    .insert({
      name,
      slug,
      region: body.region?.trim() || "Querétaro",
      start_date: startDate,
      end_date: endDate,
      is_active: body.is_active ?? true,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se creó la temporada de plataforma." },
      { status: 500 },
    );
  }

  return NextResponse.json({ platformSeason: data });
}

export async function PATCH(request: Request) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as PlatformSeasonBody;
  const platformSeasonId = body.platform_season_id?.trim();

  if (!platformSeasonId) {
    return NextResponse.json({ error: "platform_season_id es obligatorio." }, { status: 400 });
  }

  if (body.is_active) {
    await auth.admin.from("platform_seasons").update({ is_active: false }).eq("is_active", true).neq("id", platformSeasonId);
  }

  const { data, error } = await auth.admin
    .from("platform_seasons")
    .update({
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.region !== undefined ? { region: body.region.trim() || null } : {}),
      ...(body.start_date ? { start_date: body.start_date } : {}),
      ...(body.end_date ? { end_date: body.end_date } : {}),
      ...(typeof body.is_active === "boolean" ? { is_active: body.is_active } : {}),
    })
    .eq("id", platformSeasonId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se actualizó la temporada de plataforma." },
      { status: 500 },
    );
  }

  return NextResponse.json({ platformSeason: data });
}

async function assignPlatformSeason(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  body: PlatformSeasonBody,
) {
  const platformSeasonId = body.platform_season_id!.trim();

  const { data: platformSeason, error: fetchError } = await admin
    .from("platform_seasons")
    .select("*")
    .eq("id", platformSeasonId)
    .maybeSingle();

  if (fetchError || !platformSeason) {
    return NextResponse.json({ error: "Temporada de plataforma no encontrada." }, { status: 404 });
  }

  let academyIds = body.academy_ids ?? [];

  if (body.assign_public) {
    const { data: publicAcademies } = await admin
      .from("academies")
      .select("id")
      .eq("is_public", true);

    academyIds = (publicAcademies ?? []).map((academy) => academy.id);
  }

  academyIds = [...new Set(academyIds.filter(Boolean))];

  if (academyIds.length === 0) {
    return NextResponse.json({ error: "No hay academias para asignar." }, { status: 400 });
  }

  let assigned = 0;

  for (const academyId of academyIds) {
    await admin.from("seasons").update({ is_active: false }).eq("academy_id", academyId);

    const { data: existing } = await admin
      .from("seasons")
      .select("id")
      .eq("academy_id", academyId)
      .eq("platform_season_id", platformSeasonId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await admin
        .from("seasons")
        .update({
          name: platformSeason.name,
          start_date: platformSeason.start_date,
          end_date: platformSeason.end_date,
          is_active: true,
        })
        .eq("id", existing.id);

      if (!error) assigned += 1;
      continue;
    }

    const { error } = await admin.from("seasons").insert({
      academy_id: academyId,
      platform_season_id: platformSeasonId,
      name: platformSeason.name,
      start_date: platformSeason.start_date,
      end_date: platformSeason.end_date,
      is_active: true,
    });

    if (!error) assigned += 1;
  }

  return NextResponse.json({ assigned, total: academyIds.length });
}
