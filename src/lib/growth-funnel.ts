import type { SupabaseClient } from "@supabase/supabase-js";
import { listAllTutorChildrenForOps } from "@/lib/tutor-family";
import { fetchTalentGeoHeat } from "@/lib/talent-geo";

export type GrowthFunnelSnapshot = {
  roster: number;
  withEmail: number;
  withPhone: number;
  exploreOptIn: number;
  exploreReady: number;
  optInRate: number;
  statesWith100Plus: number;
  topStates: Array<{ state: string; count: number }>;
  generatedAt: string;
};

export async function loadGrowthFunnel(
  admin: SupabaseClient,
): Promise<GrowthFunnelSnapshot> {
  const [children, heat] = await Promise.all([
    listAllTutorChildrenForOps(admin),
    fetchTalentGeoHeat(admin),
  ]);

  let withEmail = 0;
  let withPhone = 0;
  let exploreOptIn = 0;
  let exploreReady = 0;

  for (const child of children) {
    if ((child.guardian_email ?? "").trim()) withEmail += 1;
    if ((child.guardian_phone ?? "").trim()) withPhone += 1;
    if (child.explore_opt_in) {
      exploreOptIn += 1;
      if (
        child.player_name?.trim() &&
        child.profile?.birth_date &&
        child.profile?.position
      ) {
        exploreReady += 1;
      }
    }
  }

  const roster = children.length;
  const optInRate = roster > 0 ? Math.round((exploreOptIn / roster) * 1000) / 10 : 0;
  const statesWith100Plus = heat.states.filter((row) => row.count >= 100).length;

  return {
    roster,
    withEmail,
    withPhone,
    exploreOptIn,
    exploreReady,
    optInRate,
    statesWith100Plus,
    topStates: heat.states.slice(0, 8),
    generatedAt: new Date().toISOString(),
  };
}
