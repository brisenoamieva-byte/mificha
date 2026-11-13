/** Quién puede ver el panel de socios (cuentas + ganancias). Nadie más. */

export const PARTNERSHIP_STAFF = [
  {
    name: "José Ricardo Briseño Amieva",
    email: "brisenoamieva@gmail.com",
    userId: "73e9a159-e464-42b5-a29d-51c678e83813",
  },
  {
    name: "Gustavo Reyes",
    email: "gkperformancehub@gmail.com",
    userId: null as string | null,
  },
] as const;

export const PARTNERSHIP_HUB_PATH = "/fut/interno/socios";

export function canViewPartnershipLedger(user: {
  id?: string | null;
  email?: string | null;
}) {
  const email = user.email?.trim().toLowerCase();
  return PARTNERSHIP_STAFF.some((person) => {
    if (person.userId && user.id && person.userId === user.id) return true;
    return Boolean(email) && person.email === email;
  });
}

/** Alias explícito: mismo allowlist (solo Ricardo y Gustavo). */
export function canAccessPartnershipHub(user: {
  id?: string | null;
  email?: string | null;
}) {
  return canViewPartnershipLedger(user);
}
