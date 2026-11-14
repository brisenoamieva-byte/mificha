/**
 * Membresías academia↔tutor: una persona (MF-) puede tener N planteles.
 * Los campos legacy linked_* en TutorChild se sincronizan con la membresía primaria
 * para no romper inbox, consentimiento y UI existentes.
 */

export type TutorMembership = {
  player_id: string;
  academy_id: string;
  academy_name: string;
  player_slug: string;
  linked_at: string;
};

export type TutorChildLinkFields = {
  linked_player_id?: string | null;
  linked_academy_id?: string | null;
  linked_academy_name?: string | null;
  linked_player_slug?: string | null;
  linked_at?: string | null;
  memberships?: TutorMembership[] | null;
};

function cleanMembership(raw: Partial<TutorMembership> | null | undefined): TutorMembership | null {
  if (!raw) return null;
  const playerId = String(raw.player_id ?? "").trim();
  const academyId = String(raw.academy_id ?? "").trim();
  if (!playerId || !academyId) return null;
  return {
    player_id: playerId,
    academy_id: academyId,
    academy_name: String(raw.academy_name ?? "Academia").trim() || "Academia",
    player_slug: String(raw.player_slug ?? "").trim(),
    linked_at: String(raw.linked_at ?? new Date().toISOString()),
  };
}

/** Normaliza memberships[] y, si falta, migra desde linked_* legacy. */
export function normalizeMemberships(raw: TutorChildLinkFields): TutorMembership[] {
  const fromArray = Array.isArray(raw.memberships)
    ? raw.memberships
        .map((row) => cleanMembership(row))
        .filter((row): row is TutorMembership => Boolean(row))
    : [];

  if (fromArray.length > 0) {
    // Deduplicar por player_id (una ficha plantel = una membresía).
    const byPlayer = new Map<string, TutorMembership>();
    for (const row of fromArray) byPlayer.set(row.player_id, row);
    return [...byPlayer.values()].sort((a, b) => a.linked_at.localeCompare(b.linked_at));
  }

  const legacy = cleanMembership({
    player_id: raw.linked_player_id ?? undefined,
    academy_id: raw.linked_academy_id ?? undefined,
    academy_name: raw.linked_academy_name ?? undefined,
    player_slug: raw.linked_player_slug ?? undefined,
    linked_at: raw.linked_at ?? undefined,
  });
  return legacy ? [legacy] : [];
}

/** Primera membresía = primaria (consentimiento / contacto por defecto). */
export function primaryMembership(
  child: TutorChildLinkFields | { memberships?: TutorMembership[] | null },
): TutorMembership | null {
  const list = Array.isArray((child as TutorChildLinkFields).memberships)
    ? normalizeMemberships(child as TutorChildLinkFields)
    : normalizeMemberships({
        ...(child as TutorChildLinkFields),
        memberships: (child as { memberships?: TutorMembership[] }).memberships,
      });
  return list[0] ?? null;
}

export function syncLegacyLinkFields(memberships: TutorMembership[]): {
  memberships: TutorMembership[];
  linked_player_id: string | null;
  linked_academy_id: string | null;
  linked_academy_name: string | null;
  linked_player_slug: string | null;
  linked_at: string | null;
} {
  const primary = memberships[0] ?? null;
  return {
    memberships,
    linked_player_id: primary?.player_id ?? null,
    linked_academy_id: primary?.academy_id ?? null,
    linked_academy_name: primary?.academy_name ?? null,
    linked_player_slug: primary?.player_slug ?? null,
    linked_at: primary?.linked_at ?? null,
  };
}

export function childMemberships(child: TutorChildLinkFields): TutorMembership[] {
  return normalizeMemberships(child);
}

export function childHasAnyMembership(child: TutorChildLinkFields) {
  return childMemberships(child).length > 0;
}

export function childHasPlayerMembership(child: TutorChildLinkFields, playerId: string) {
  const id = String(playerId ?? "").trim();
  if (!id) return false;
  return childMemberships(child).some((row) => row.player_id === id);
}

export function childMembershipForAcademy(
  child: TutorChildLinkFields,
  academyId: string,
): TutorMembership | null {
  const id = String(academyId ?? "").trim();
  if (!id) return null;
  return childMemberships(child).find((row) => row.academy_id === id) ?? null;
}

export function linkedPlayerIds(child: TutorChildLinkFields): string[] {
  return childMemberships(child).map((row) => row.player_id);
}

export function upsertMembershipList(
  current: TutorMembership[],
  next: TutorMembership,
): TutorMembership[] {
  const without = current.filter(
    (row) => row.player_id !== next.player_id && row.academy_id !== next.academy_id,
  );
  // Si ya había otra membresía en la misma academia, la reemplaza (un plantel por academia).
  return [...without, next].sort((a, b) => a.linked_at.localeCompare(b.linked_at));
}

export function removeMembershipByPlayer(
  current: TutorMembership[],
  playerId: string,
): TutorMembership[] {
  const id = String(playerId ?? "").trim();
  return current.filter((row) => row.player_id !== id);
}
