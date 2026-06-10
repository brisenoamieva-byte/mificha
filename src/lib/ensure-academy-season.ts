import type { SupabaseClient } from "@supabase/supabase-js";
import type { Season } from "@/types/database";

export async function getActiveAcademySeason(
  admin: SupabaseClient,
  academyId: string,
): Promise<Season | null> {
  const { data } = await admin
    .from("seasons")
    .select("*")
    .eq("academy_id", academyId)
    .eq("is_active", true)
    .maybeSingle();

  return data ?? null;
}

/** Asigna la temporada de plataforma activa a una academia si aún no tiene una. */
export async function ensureAcademySeasonFromPlatform(
  admin: SupabaseClient,
  academyId: string,
): Promise<{ season: Season | null; created: boolean; reason?: string }> {
  const existing = await getActiveAcademySeason(admin, academyId);
  if (existing) {
    return { season: existing, created: false };
  }

  const { data: platformSeason } = await admin
    .from("platform_seasons")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!platformSeason) {
    return {
      season: null,
      created: false,
      reason: "no_platform_season",
    };
  }

  const { data: linkedExisting } = await admin
    .from("seasons")
    .select("*")
    .eq("academy_id", academyId)
    .eq("platform_season_id", platformSeason.id)
    .maybeSingle();

  if (linkedExisting) {
    const { data: reactivated, error } = await admin
      .from("seasons")
      .update({
        name: platformSeason.name,
        start_date: platformSeason.start_date,
        end_date: platformSeason.end_date,
        is_active: true,
      })
      .eq("id", linkedExisting.id)
      .select("*")
      .single();

    if (error || !reactivated) {
      return { season: null, created: false, reason: "update_failed" };
    }

    await admin
      .from("seasons")
      .update({ is_active: false })
      .eq("academy_id", academyId)
      .neq("id", reactivated.id);

    return { season: reactivated, created: false };
  }

  await admin.from("seasons").update({ is_active: false }).eq("academy_id", academyId);

  const { data: created, error } = await admin
    .from("seasons")
    .insert({
      academy_id: academyId,
      platform_season_id: platformSeason.id,
      name: platformSeason.name,
      start_date: platformSeason.start_date,
      end_date: platformSeason.end_date,
      is_active: true,
    })
    .select("*")
    .single();

  if (error || !created) {
    return { season: null, created: false, reason: "insert_failed" };
  }

  return { season: created, created: true };
}
