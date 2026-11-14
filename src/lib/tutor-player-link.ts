import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bindPlayerPublicCode,
  normalizePublicCode,
  readPlayerPublicCodeMap,
} from "@/lib/public-player-code";
import {
  addTutorChildMembership,
  getTutorChildForGuardian,
  listTutorPublicCodes,
  removeTutorChildMembership,
  setTutorChildPublicCode,
  updateTutorChildLink,
  type TutorChild,
} from "@/lib/tutor-family";
import {
  childHasPlayerMembership,
  childMemberships,
  linkedPlayerIds,
} from "@/lib/tutor-memberships";

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

/** Candidatos de plantel: excluye membresías ya ligadas; permite otras academias. */
export async function suggestAcademyPlayersForChild(
  admin: SupabaseClient,
  child: TutorChild,
): Promise<TutorLinkSuggestion[]> {
  const already = new Set(linkedPlayerIds(child));
  const linkedAcademyIds = new Set(childMemberships(child).map((row) => row.academy_id));
  const byId = new Map<string, TutorLinkSuggestion>();
  const code = normalizePublicCode(child.public_code);

  if (code) {
    const playerMap = await readPlayerPublicCodeMap(admin);
    // Un código puede apuntar a un player; también buscamos todos los players con ese code en map.
    for (const [playerId, value] of Object.entries(playerMap)) {
      if (normalizePublicCode(value) !== code) continue;
      if (already.has(playerId)) continue;
      const suggestion = await hydratePlayerSuggestion(
        admin,
        playerId,
        `Mismo código ${code}`,
        "code",
      );
      if (suggestion && !linkedAcademyIds.has(suggestion.academy_id)) {
        byId.set(suggestion.player_id, suggestion);
      }
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
      if (already.has(id) || byId.has(id)) continue;
      if (linkedAcademyIds.has(String(row.academy_id))) continue;
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
    let query = admin
      .from("players")
      .select(
        "id, first_name, last_name, slug, academy_id, guardian_email, guardian_phone, academies(name)",
      )
      .limit(80);
    if (email && phone) {
      query = query.or(
        `guardian_email.eq.${email},guardian_phone.ilike.%${phone.slice(-10)}%`,
      );
    } else if (email) {
      query = query.eq("guardian_email", email);
    } else {
      query = query.ilike("guardian_phone", `%${phone.slice(-10)}%`);
    }
    const { data: byContact } = await query;
    for (const row of byContact ?? []) {
      const playerName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
      if (!namesLikelySame(child.player_name, playerName)) continue;
      const id = String(row.id);
      if (already.has(id) || byId.has(id)) continue;
      if (linkedAcademyIds.has(String(row.academy_id))) continue;
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

  return [...byId.values()].sort((a, b) => {
    const rank = matchRank(a.match) - matchRank(b.match);
    if (rank !== 0) return rank;
    return a.player_name.localeCompare(b.player_name, "es");
  });
}

/** Añade membresía (no reemplaza otras academias). */
export async function linkTutorChildToPlayer(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  playerId: string,
) {
  const child = await getTutorChildForGuardian(admin, userId, childId);
  if (!child) throw new Error("No encontramos a ese jugador en tu cuenta de tutor.");

  if (childHasPlayerMembership(child, playerId)) {
    return child;
  }

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

  const academyId = String(player.academy_id);
  if (childMemberships(child).some((row) => row.academy_id === academyId)) {
    throw new Error("Ya hay un vínculo con esa academia. Desvincúlalo antes de cambiarlo.");
  }

  const updated = await addTutorChildMembership(admin, userId, childId, {
    player_id: String(player.id),
    academy_id: academyId,
    academy_name: academyName || "Academia",
    player_slug: String(player.slug ?? ""),
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

/** Quita todas las membresías. */
export async function unlinkTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
) {
  return updateTutorChildLink(admin, userId, childId, {
    memberships: [],
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
  });
}

/** Quita una membresía concreta. */
export async function unlinkTutorChildPlayer(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  playerId: string,
) {
  return removeTutorChildMembership(admin, userId, childId, playerId);
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
    // Ya no excluimos si tiene otras membresías; solo si… no, aún puede ligarse a otra academia.
    // Si el match es por código y ya tiene ese player, skip happens at link time.

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
  if (childHasPlayerMembership(target, playerId)) {
    return target;
  }

  return linkTutorChildToPlayer(admin, target.guardian_user_id, childId, playerId);
}
