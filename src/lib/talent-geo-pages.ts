import type { SupabaseClient } from "@supabase/supabase-js";
import { MEXICO_STATES, normalizeLocation } from "@/lib/mexico-locations";
import { fetchTalentGeoHeat, type TalentGeoHeat } from "@/lib/talent-geo";
import { stateSlug } from "@/lib/viral-share";

export function resolveStateFromSlug(slug: string): string | null {
  const normalized = normalizeLocation(slug.replace(/-/g, " "));
  const hit = MEXICO_STATES.find(
    (state) =>
      stateSlug(state) === slug ||
      normalizeLocation(state) === normalized,
  );
  return hit ?? null;
}

export async function getTalentIndex(
  admin: SupabaseClient,
): Promise<TalentGeoHeat> {
  return fetchTalentGeoHeat(admin);
}

export function publicOptInHint(heat: TalentGeoHeat, state?: string) {
  if (state) {
    const bucket = heat.states.find((row) => row.state === state);
    return {
      total: bucket?.count ?? 0,
      label: state,
    };
  }
  return {
    total: heat.totalFichas,
    label: "México",
  };
}
