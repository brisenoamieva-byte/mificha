import type { SupabaseClient } from "@supabase/supabase-js";
import type { TutorChild } from "@/lib/tutor-family";

/**
 * Dual-write opcional a Postgres (tabla tutor_children).
 * Si la tabla aún no existe en el proyecto, falla en silencio.
 */
export async function upsertTutorChildRow(
  admin: SupabaseClient,
  child: TutorChild,
): Promise<void> {
  const row = {
    id: child.id,
    guardian_user_id: child.guardian_user_id?.trim() || null,
    guardian_email: (child.guardian_email ?? "").trim().toLowerCase() || null,
    guardian_phone: child.guardian_phone || null,
    player_name: child.player_name,
    public_code: child.public_code || null,
    share_token: child.share_token || null,
    explore_opt_in: Boolean(child.explore_opt_in),
    explore_opt_in_at: child.explore_opt_in_at,
    birth_date: child.profile?.birth_date || null,
    position: child.profile?.position || null,
    city: child.profile?.city || null,
    state: child.profile?.state || null,
    club: child.profile?.club || null,
    profile: child.profile ?? {},
    linked_player_id: child.linked_player_id || null,
    linked_academy_id: child.linked_academy_id || null,
    source: Array.isArray(child.source_folios) && child.source_folios.length
      ? "visoria"
      : "tutor",
    updated_at: new Date().toISOString(),
    created_at: child.created_at || new Date().toISOString(),
  };

  const { error } = await admin.from("tutor_children").upsert(row, {
    onConflict: "id",
  });
  if (error && !/does not exist|schema cache/i.test(error.message)) {
    console.warn("[tutor_children upsert]", error.message);
  }
}

export async function syncTutorRosterToPostgres(
  admin: SupabaseClient,
  roster: TutorChild[],
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  for (const child of roster) {
    try {
      await upsertTutorChildRow(admin, child);
      ok += 1;
    } catch {
      failed += 1;
    }
  }
  return { ok, failed };
}

export type ExploreApiPlayer = {
  code: string;
  name: string;
  position: string | null;
  city: string | null;
  state: string | null;
  birth_date: string | null;
};

/**
 * Prefer Postgres when populated; caller should fall back to JSON directory.
 */
export async function listExplorePlayersFromPg(
  admin: SupabaseClient,
  opts?: { state?: string; city?: string; limit?: number },
): Promise<ExploreApiPlayer[] | null> {
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 500);
  let query = admin
    .from("tutor_children")
    .select("public_code, player_name, position, city, state, birth_date, explore_opt_in")
    .eq("explore_opt_in", true)
    .not("public_code", "is", null)
    .limit(limit);

  if (opts?.state) query = query.ilike("state", opts.state);
  if (opts?.city) query = query.ilike("city", opts.city);

  const { data, error } = await query;
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return null;
    console.warn("[explore pg]", error.message);
    return null;
  }
  if (!data || data.length === 0) return [];

  return data
    .filter((row) => Boolean(row.public_code))
    .map((row) => ({
      code: String(row.public_code),
      name: String(row.player_name ?? "Jugador"),
      position: row.position ?? null,
      city: row.city ?? null,
      state: row.state ?? null,
      birth_date: row.birth_date ?? null,
    }));
}
