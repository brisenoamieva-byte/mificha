/** Códigos MF- del círculo cercano (local al dispositivo). Máx. 15. */

export type MiEquipoMember = {
  code: string;
  name: string;
  addedAt: string;
};

export const MI_EQUIPO_STORAGE_KEY = "mificha.mi-equipo.v1";
export const MI_EQUIPO_MAX = 15;

function normalizeCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function readMiEquipo(): MiEquipoMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MI_EQUIPO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MiEquipoMember[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => row && typeof row.code === "string" && row.code.length >= 4)
      .slice(0, MI_EQUIPO_MAX);
  } catch {
    return [];
  }
}

function writeMiEquipo(rows: MiEquipoMember[]) {
  window.localStorage.setItem(MI_EQUIPO_STORAGE_KEY, JSON.stringify(rows.slice(0, MI_EQUIPO_MAX)));
}

export function upsertMiEquipoMember(input: { code: string; name: string }) {
  const code = normalizeCode(input.code);
  if (!/^MF-[A-Z0-9]+$/i.test(code)) {
    return { ok: false as const, reason: "bad_code" as const };
  }
  const name = input.name.trim() || code;
  const current = readMiEquipo().filter((row) => normalizeCode(row.code) !== code);
  current.unshift({
    code,
    name,
    addedAt: new Date().toISOString(),
  });
  writeMiEquipo(current);
  return { ok: true as const, members: current };
}

export function removeMiEquipoMember(code: string) {
  const key = normalizeCode(code);
  const next = readMiEquipo().filter((row) => normalizeCode(row.code) !== key);
  writeMiEquipo(next);
  return next;
}

export function hasMiEquipoMember(code: string) {
  const key = normalizeCode(code);
  return readMiEquipo().some((row) => normalizeCode(row.code) === key);
}
