/** Quién puede ver la base de inscritos de visorías. Nadie más. */

const VISORIA_ROSTER_STAFF = [
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

export function canViewVisoriaRoster(user: {
  id?: string | null;
  email?: string | null;
}) {
  const email = user.email?.trim().toLowerCase();
  return VISORIA_ROSTER_STAFF.some((person) => {
    if (person.userId && user.id && person.userId === user.id) return true;
    return Boolean(email) && person.email === email;
  });
}
