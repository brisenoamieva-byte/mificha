import type { SupabaseClient } from "@supabase/supabase-js";
import { PARTNERSHIP_STAFF } from "@/lib/partnership-access";
import { listAllTutorChildrenForOps, type TutorChild } from "@/lib/tutor-family";

export type PersonaAccountRow = {
  key: string;
  guardian_user_id: string;
  guardian_email: string;
  guardian_phone: string;
  player_count: number;
  players: Array<{
    id: string;
    player_name: string;
    public_code: string;
    explore_opt_in: boolean;
    city: string | null;
    created_at: string;
  }>;
  explore_opt_in_count: number;
  latest_created_at: string | null;
};

export type PartnershipAccountsSnapshot = {
  partners: Array<{ name: string; email: string }>;
  personaAccounts: PersonaAccountRow[];
  totals: {
    accounts: number;
    players: number;
    exploreOptIn: number;
  };
};

function accountKey(child: TutorChild) {
  const email = (child.guardian_email ?? "").trim().toLowerCase();
  if (email) return `email:${email}`;
  if (child.guardian_user_id) return `user:${child.guardian_user_id}`;
  const phone = (child.guardian_phone ?? "").replace(/\D/g, "");
  if (phone) return `phone:${phone}`;
  return `child:${child.id}`;
}

export async function loadPartnershipAccounts(
  admin: SupabaseClient,
): Promise<PartnershipAccountsSnapshot> {
  const children = await listAllTutorChildrenForOps(admin);
  const byKey = new Map<string, PersonaAccountRow>();

  for (const child of children) {
    const key = accountKey(child);
    const existing = byKey.get(key);
    const player = {
      id: child.id,
      player_name: child.player_name,
      public_code: child.public_code,
      explore_opt_in: Boolean(child.explore_opt_in),
      city: child.profile?.city ?? null,
      created_at: child.created_at,
    };

    if (!existing) {
      byKey.set(key, {
        key,
        guardian_user_id: child.guardian_user_id,
        guardian_email: (child.guardian_email ?? "").trim().toLowerCase(),
        guardian_phone: child.guardian_phone ?? "",
        player_count: 1,
        players: [player],
        explore_opt_in_count: player.explore_opt_in ? 1 : 0,
        latest_created_at: child.created_at,
      });
      continue;
    }

    existing.player_count += 1;
    existing.players.push(player);
    if (player.explore_opt_in) existing.explore_opt_in_count += 1;
    const email = (child.guardian_email ?? "").trim().toLowerCase();
    if (!existing.guardian_email && email) {
      existing.guardian_email = email;
    }
    if (!existing.guardian_phone && child.guardian_phone) {
      existing.guardian_phone = child.guardian_phone;
    }
    if (
      !existing.latest_created_at ||
      child.created_at > existing.latest_created_at
    ) {
      existing.latest_created_at = child.created_at;
    }
  }

  const personaAccounts = [...byKey.values()].sort((a, b) => {
    const left = a.latest_created_at ?? "";
    const right = b.latest_created_at ?? "";
    return right.localeCompare(left);
  });

  return {
    partners: PARTNERSHIP_STAFF.map((person) => ({
      name: person.name,
      email: person.email,
    })),
    personaAccounts,
    totals: {
      accounts: personaAccounts.length,
      players: personaAccounts.reduce((sum, row) => sum + row.player_count, 0),
      exploreOptIn: personaAccounts.reduce(
        (sum, row) => sum + row.explore_opt_in_count,
        0,
      ),
    },
  };
}
