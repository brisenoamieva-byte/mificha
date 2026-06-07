/** Usuarios autorizados para /interno/pitch (comma-separated UUIDs). */
export function getPitchAllowedUserIds(): string[] {
  const raw =
    process.env.PITCH_ALLOWED_USER_IDS?.trim() ||
    process.env.SEED_OWNER_ID?.trim() ||
    "";

  return raw
    .split(",")
    .map((id) => id.replace(/[<>]/g, "").trim())
    .filter(Boolean);
}

export function canAccessPitchDeck(userId: string | undefined | null): boolean {
  if (!userId) return false;
  const allowed = getPitchAllowedUserIds();
  if (allowed.length === 0) return false;
  return allowed.includes(userId);
}
