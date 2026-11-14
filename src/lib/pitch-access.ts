/** Solo el fundador (Ricardo). No usar listas amplias de partners/GPH aquí. */
const FOUNDER = {
  userId: "73e9a159-e464-42b5-a29d-51c678e83813",
  email: "brisenoamieva@gmail.com",
};

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.replace(/[<>]/g, "").trim())
    .filter(Boolean);
}

/** Playbook /lanzamiento y materiales de venta: únicamente el fundador. */
export function canAccessFounderPlaybook(
  userId: string | undefined | null,
  email?: string | undefined | null,
): boolean {
  const founderId =
    process.env.FOUNDER_USER_ID?.trim() || FOUNDER.userId;
  const founderEmail = (
    process.env.FOUNDER_EMAIL?.trim() || FOUNDER.email
  ).toLowerCase();

  if (userId && userId === founderId) return true;
  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && normalizedEmail === founderEmail) return true;
  return false;
}

/** Usuarios autorizados para herramientas internas (comma-separated UUIDs). */
export function getPitchAllowedUserIds(): string[] {
  const explicit = process.env.PITCH_ALLOWED_USER_IDS?.trim();
  if (explicit) return parseList(explicit);

  const seedOwner = process.env.SEED_OWNER_ID?.trim();
  if (seedOwner) return parseList(seedOwner);

  return [FOUNDER.userId];
}

export function getPitchAllowedEmails(): string[] {
  const explicit = process.env.PITCH_ALLOWED_EMAILS?.trim();
  if (explicit) {
    return parseList(explicit).map((email) => email.toLowerCase());
  }

  return [FOUNDER.email];
}

export function canAccessPitchDeck(
  userId: string | undefined | null,
  email?: string | undefined | null,
): boolean {
  // El fundador siempre entra; partners solo si están en PITCH_ALLOWED_* explícito.
  if (canAccessFounderPlaybook(userId, email)) return true;

  const allowedIds = getPitchAllowedUserIds();
  const allowedEmails = getPitchAllowedEmails();

  if (userId && allowedIds.includes(userId)) return true;

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && allowedEmails.includes(normalizedEmail)) return true;

  return false;
}
