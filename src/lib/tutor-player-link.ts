import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bindPlayerPublicCode,
  normalizePublicCode,
  readPlayerPublicCodeMap,
} from "@/lib/public-player-code";
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
  /** Match por código MF tiene prioridad para el CTA. */
  match: "code" | "contact";
}

async function hydratePlayerSuggestion(
  admin: SupabaseClient,
  playerId: string,
  reason: string,
  match: "code" | "contact",
): Promise<TutorLinkSuggestion | null> {
  const { data: player, error } = await admin
    .from("players")
    .select("id, first_name, last_name, slug, academy_id, academies(name)")
    .eq("id", playerId)
    .maybeSingle();
  if (error || !player) {
    const plain = await admin
      .from("players")
      .select("id, first_name, last_name, slug, academy_id")
      .eq("id", playerId)
      .maybeSingle();
    if (plain.error || !plain.data) return null;
    const { data: academy } = await admin
      .from("academies")
      .select("id, name")
      .eq("id", plain.data.academy_id)
      .maybeSingle();
    return {
      player_id: String(plain.data.id),
      academy_id: String(plain.data.academy_id),
      academy_name: academy?.name || "Academia",
      player_name: `${plain.data.first_name ?? ""} ${plain.data.last_name ?? ""}`.trim(),
      slug: String(plain.data.slug ?? ""),
      reason,
      match,
    };
  }

  const academyRel = player.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyRel)
    ? academyRel[0]?.name
    : academyRel?.name;

  return {
    player_id: String(player.id),
    academy_id: String(player.academy_id),
    academy_name: academyName || "Academia",
    player_name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
    slug: String(player.slug ?? ""),
    reason,
    match,
  };
}

/** Candidatos de plantel: primero mismo código MF, luego contacto+nombre. */
export async function suggestAcademyPlayersForChild(
  admin: SupabaseClient,
  child: TutorChild,
): Promise<TutorLinkSuggestion[]> {
  if (child.linked_player_id) return [];

  const byId = new Map<string, TutorLinkSuggestion>();
  const code = normalizePublicCode(child.public_code);

  if (code) {
    const playerMap = await readPlayerPublicCodeMap(admin);
    const playerId = Object.entries(playerMap).find(
      ([, value]) => normalizePublicCode(value) === code,
    )?.[0];
    if (playerId) {
      const suggestion = await hydratePlayerSuggestion(
        admin,
        playerId,
        `Mismo código ${code}`,
        "code",
      );
      if (suggestion) byId.set(suggestion.player_id, suggestion);
    }
  }

  const email = child.guardian_email.trim().toLowerCase();
  const phone = phoneKey(child.guardian_phone);
  if (email || phone) {
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

    const rows = error
      ? (
          await admin
            .from("players")
            .select(
              "id, first_name, last_name, slug, academy_id, guardian_email, guardian_phone",
            )
            .or(filters.join(","))
            .limit(40)
        ).data ?? []
      : players ?? [];

    if (error) {
      const enriched = await enrichSuggestions(admin, child, rows as Array<Record<string, unknown>>);
      for (const item of enriched) {
        if (!byId.has(item.player_id)) byId.set(item.player_id, item);
      }
    } else {
      for (const row of rows) {
        const playerName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
        if (!namesLikelySame(child.player_name, playerName)) continue;
        const id = String(row.id);
        if (byId.has(id)) continue;
        const academyRel = (row as { academies?: { name?: string } | { name?: string }[] | null })
          .academies;
        const academyName = Array.isArray(academyRel)
          ? academyRel[0]?.name
          : academyRel?.name;
        byId.set(id, {
          player_id: id,
          academy_id: String(row.academy_id),
          academy_name: academyName || "Academia",
          player_name: playerName,
          slug: String(row.slug ?? ""),
          reason: "Mismo contacto de tutor y nombre parecido",
          match: "contact",
        });
      }
    }
  }

  return [...byId.values()].sort((a, b) => {
    if (a.match === b.match) return a.player_name.localeCompare(b.player_name);
    return a.match === "code" ? -1 : 1;
  });
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
      match: "contact",
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
