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

export type TutorLinkMatchKind = "code" | "birth" | "contact";

export interface TutorLinkSuggestion {
  player_id: string;
  academy_id: string;
  academy_name: string;
  player_name: string;
  slug: string;
  reason: string;
  /** Prioridad: code → birth → contact. */
  match: TutorLinkMatchKind;
}

export interface AcademyTutorMatch {
  child_id: string;
  guardian_user_id: string;
  player_name: string;
  public_code: string;
  birth_date: string | null;
  reason: string;
  match: TutorLinkMatchKind;
}

function matchRank(kind: TutorLinkMatchKind) {
  if (kind === "code") return 0;
  if (kind === "birth") return 1;
  return 2;
}

function birthKey(value: string | null | undefined) {
  const raw = String(value ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || raw === "1900-01-01") return "";
  return raw;
}

async function hydratePlayerSuggestion(
  admin: SupabaseClient,
  playerId: string,
  reason: string,
  match: TutorLinkMatchKind,
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

  const birth = birthKey(child.profile.birth_date);
  if (birth) {
    const { data: byBirth } = await admin
      .from("players")
      .select(
        "id, first_name, last_name, slug, academy_id, birth_date, academies(name)",
      )
      .eq("birth_date", birth)
      .limit(60);
    for (const row of byBirth ?? []) {
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
        reason: `Mismo nombre y fecha de nacimiento (${birth})`,
        match: "birth",
      });
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
    const rank = matchRank(a.match) - matchRank(b.match);
    if (rank !== 0) return rank;
    return a.player_name.localeCompare(b.player_name, "es");
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

/** Candidatos tutor al dar de alta / editar en plantel de academia. */
export async function findTutorMatchesForAcademyPlayer(
  admin: SupabaseClient,
  input: {
    name: string;
    birthDate?: string | null;
    guardianPhone?: string | null;
    guardianEmail?: string | null;
    publicCode?: string | null;
  },
): Promise<AcademyTutorMatch[]> {
  const { listAllTutorChildrenForOps } = await import("@/lib/tutor-family");
  const roster = await listAllTutorChildrenForOps(admin);
  const byId = new Map<string, AcademyTutorMatch>();
  const code = normalizePublicCode(input.publicCode);
  const birth = birthKey(input.birthDate);
  const email = String(input.guardianEmail ?? "")
    .trim()
    .toLowerCase();
  const phone = phoneKey(input.guardianPhone);
  const name = String(input.name ?? "").trim();

  for (const child of roster) {
    if (child.linked_player_id) continue;

    if (code && normalizePublicCode(child.public_code) === code) {
      byId.set(child.id, {
        child_id: child.id,
        guardian_user_id: child.guardian_user_id,
        player_name: child.player_name,
        public_code: child.public_code,
        birth_date: child.profile.birth_date,
        reason: `Mismo código ${code}`,
        match: "code",
      });
      continue;
    }

    if (
      birth &&
      birthKey(child.profile.birth_date) === birth &&
      namesLikelySame(name, child.player_name)
    ) {
      byId.set(child.id, {
        child_id: child.id,
        guardian_user_id: child.guardian_user_id,
        player_name: child.player_name,
        public_code: child.public_code,
        birth_date: child.profile.birth_date,
        reason: `Mismo nombre y fecha de nacimiento (${birth})`,
        match: "birth",
      });
      continue;
    }

    const contactOk =
      (email && child.guardian_email.trim().toLowerCase() === email) ||
      (phone && phoneKey(child.guardian_phone) === phone);
    if (contactOk && namesLikelySame(name, child.player_name)) {
      byId.set(child.id, {
        child_id: child.id,
        guardian_user_id: child.guardian_user_id,
        player_name: child.player_name,
        public_code: child.public_code,
        birth_date: child.profile.birth_date,
        reason: "Mismo contacto de tutor y nombre parecido",
        match: "contact",
      });
    }
  }

  return [...byId.values()].sort((a, b) => {
    const rank = matchRank(a.match) - matchRank(b.match);
    if (rank !== 0) return rank;
    return a.player_name.localeCompare(b.player_name, "es");
  });
}

/**
 * Academia conecta un player de plantel con una ficha tutor.
 * La autorización (owner/staff/GPH) la hace el caller; aquí solo valida pertenencia.
 */
export async function linkAcademyPlayerToTutorChild(
  admin: SupabaseClient,
  _userId: string,
  academyId: string,
  playerId: string,
  childId: string,
) {
  const { data: player, error } = await admin
    .from("players")
    .select("id, academy_id, first_name, last_name, slug, academies(name)")
    .eq("id", playerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!player) throw new Error("Jugador de academia no encontrado.");
  if (String(player.academy_id) !== academyId) {
    throw new Error("Ese jugador no pertenece a tu academia.");
  }

  const { listAllTutorChildrenForOps } = await import("@/lib/tutor-family");
  const roster = await listAllTutorChildrenForOps(admin);
  const target = roster.find((row) => row.id === childId);
  if (!target) throw new Error("No encontramos la ficha tutor.");
  if (target.linked_player_id && target.linked_player_id !== playerId) {
    throw new Error("Esa ficha tutor ya está vinculada a otro jugador.");
  }

  return linkTutorChildToPlayer(admin, target.guardian_user_id, childId, playerId);
}
