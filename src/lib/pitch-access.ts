/** Fallback del fundador cuando no hay variables de entorno en Vercel. */
const PITCH_OWNER_FALLBACK = {
  userId: "73e9a159-e464-42b5-a29d-51c678e83813",
  email: "brisenoamieva@gmail.com",
};

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.replace(/[<>]/g, "").trim())
    .filter(Boolean);
}

/** Usuarios autorizados para /interno/pitch (comma-separated UUIDs). */
export function getPitchAllowedUserIds(): string[] {
  const explicit = process.env.PITCH_ALLOWED_USER_IDS?.trim();
  if (explicit) return parseList(explicit);

  const seedOwner = process.env.SEED_OWNER_ID?.trim();
  if (seedOwner) return parseList(seedOwner);

  return [PITCH_OWNER_FALLBACK.userId];
}

export function getPitchAllowedEmails(): string[] {
  const explicit = process.env.PITCH_ALLOWED_EMAILS?.trim();
  if (explicit) {
    return parseList(explicit).map((email) => email.toLowerCase());
  }

  return [PITCH_OWNER_FALLBACK.email];
}

export function canAccessPitchDeck(
  userId: string | undefined | null,
  email?: string | undefined | null,
): boolean {
  const allowedIds = getPitchAllowedUserIds();
  const allowedEmails = getPitchAllowedEmails();

  if (userId && allowedIds.includes(userId)) return true;

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail && allowedEmails.includes(normalizedEmail)) return true;

  return false;
}
