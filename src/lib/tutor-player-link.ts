import type { SupabaseClient } from "@supabase/supabase-js";
import { bindPlayerPublicCode } from "@/lib/public-player-code";
import {
  getTutorChildForGuardian,
  listTutorPublicCodes,
  setTutorChildPublicCode,
  updateTutorChildLink,
  type TutorChild,
} from "@/lib/tutor-family";

function phoneKey(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "";
}

function nameKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function namesLikelySame(a: string, b: string) {
  const left = nameKey(a);
  const right = nameKey(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftParts = left.split(" ").filter((p) => p.length > 1);
  const rightParts = right.split(" ").filter((p) => p.length > 1);
  const shared = leftParts.filter((p) => rightParts.includes(p));
  return shared.length >= 2;
}

export interface TutorLinkSuggestion {
  player_id: string;
  academy_id: string;
  academy_name: string;
  player_name: string;
  slug: string;
  reason: string;
}

/** Candidatos de plantel que parecen ser el mismo hijo (nombre + contacto tutor). */
export async function suggestAcademyPlayersForChild(
  admin: SupabaseClient,
  child: TutorChild,
): Promise<TutorLinkSuggestion[]> {
  const email = child.guardian_email.trim().toLowerCase();
  const phone = phoneKey(child.guardian_phone);
  if (!email && !phone) return [];

  const filters: string[] = [];
  if (email) filters.push(`guardian_email.eq.${email}`);
  if (phone) filters.push(`guardian_phone.eq.${phone}`);

  const { data: players, error } = await admin
    .from("players")
    .select(
      "id, first_name, last_name, slug, academy_id, guardian_email, guardian_phone, academies(name)",
    )
    .or(filters.join(","))
    .limit(40);

  if (error) {
    // Fallback without join if relationship name differs
    const plain = await admin
      .from("players")
      .select("id, first_name, last_name, slug, academy_id, guardian_email, guardian_phone")
      .or(filters.join(","))
      .limit(40);
    if (plain.error) throw new Error(plain.error.message);
    return enrichSuggestions(admin, child, plain.data ?? []);
  }

  const suggestions: TutorLinkSuggestion[] = [];
  for (const row of players ?? []) {
    const playerName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
    if (!namesLikelySame(child.player_name, playerName)) continue;
    const academyRel = row.academies as { name?: string } | { name?: string }[] | null;
    const academyName = Array.isArray(academyRel)
      ? academyRel[0]?.name
      : academyRel?.name;
    suggestions.push({
      player_id: String(row.id),
      academy_id: String(row.academy_id),
      academy_name: academyName || "Academia",
      player_name: playerName,
      slug: String(row.slug ?? ""),
      reason: "Mismo contacto de tutor y nombre parecido",
    });
  }
  return suggestions;
}

async function enrichSuggestions(
  admin: SupabaseClient,
  child: TutorChild,
  rows: Array<Record<string, unknown>>,
) {
  const academyIds = [...new Set(rows.map((row) => String(row.academy_id)))];
  const { data: academies } = await admin
    .from("academies")
    .select("id, name")
    .in("id", academyIds);
  const academyMap = new Map(
    (academies ?? []).map((row) => [String(row.id), String(row.name ?? "Academia")]),
  );

  const suggestions: TutorLinkSuggestion[] = [];
  for (const row of rows) {
    const playerName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
    if (!namesLikelySame(child.player_name, playerName)) continue;
    suggestions.push({
      player_id: String(row.id),
      academy_id: String(row.academy_id),
      academy_name: academyMap.get(String(row.academy_id)) || "Academia",
      player_name: playerName,
      slug: String(row.slug ?? ""),
      reason: "Mismo contacto de tutor y nombre parecido",
    });
  }
  return suggestions;
}

export async function linkTutorChildToPlayer(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  playerId: string,
) {
  const child = await getTutorChildForGuardian(admin, userId, childId);
  if (!child) throw new Error("No encontramos a ese jugador en tu cuenta de tutor.");

  const { data: player, error } = await admin
    .from("players")
    .select("id, academy_id, first_name, last_name, slug, academies(name)")
    .eq("id", playerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!player) throw new Error("Jugador de academia no encontrado.");

  const academyRel = player.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyRel)
    ? academyRel[0]?.name
    : academyRel?.name;

  const updated = await updateTutorChildLink(admin, userId, childId, {
    linked_player_id: String(player.id),
    linked_academy_id: String(player.academy_id),
    linked_academy_name: academyName || "Academia",
    linked_player_slug: String(player.slug ?? ""),
    linked_at: new Date().toISOString(),
  });

  const used = await listTutorPublicCodes(admin);
  const canonical = await bindPlayerPublicCode(
    admin,
    String(player.id),
    updated.public_code,
    used,
  );
  if (canonical !== updated.public_code) {
    return setTutorChildPublicCode(admin, userId, childId, canonical);
  }

  return updated;
}

export async function unlinkTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
) {
  return updateTutorChildLink(admin, userId, childId, {
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
  });
}
