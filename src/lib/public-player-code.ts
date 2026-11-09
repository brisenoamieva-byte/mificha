import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const OPS_BUCKET = "mificha-ops";
const PLAYER_CODES = "families/player-public-codes.json";
const VISORIA_CODES = "visorias/public-codes.json";
const ROSTER = "families/roster.json";
/** Registro global: un código → un dueño. Evita cruces entre plantel, tutor y visorías. */
const REGISTRY = "families/public-code-registry.json";

/** Sin 0/O/1/I/L para dictarlo por WhatsApp. 32 símbolos. */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export const PUBLIC_CODE_PREFIX = "MF-";
/** Nuevos códigos: 5 chars → 32^5 ≈ 33.5M combinaciones (miles sin colisión práctica). */
export const PUBLIC_CODE_BODY_LENGTH = 5;
/** Se aceptan 4–6 por códigos legacy (MF-XXXX) y margen a futuro. */
const PUBLIC_CODE_BODY_MIN = 4;
const PUBLIC_CODE_BODY_MAX = 6;

export type PublicCodeOwnerKind = "player" | "tutor" | "visoria";

export interface PublicCodeRegistryEntry {
  kind: PublicCodeOwnerKind;
  id: string;
  updated_at: string;
}

export type PublicCodeRegistry = Record<string, PublicCodeRegistryEntry>;

export function isPublicCodeFormat(raw: string) {
  const pattern = new RegExp(
    `^MF-[${CODE_ALPHABET}]{${PUBLIC_CODE_BODY_MIN},${PUBLIC_CODE_BODY_MAX}}$`,
    "i",
  );
  return pattern.test(raw.trim());
}

export function normalizePublicCode(raw: string | null | undefined): string | null {
  const clean = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!isPublicCodeFormat(clean)) return null;
  return clean;
}

/** Genera un código no presente en `used`. No persiste: quien llama debe registrar. */
export function mintPublicCode(used: Set<string>): string {
  const maxAttempts = 80;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let body = "";
    const bytes = randomBytes(PUBLIC_CODE_BODY_LENGTH);
    for (let i = 0; i < PUBLIC_CODE_BODY_LENGTH; i += 1) {
      body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    }
    const code = `${PUBLIC_CODE_PREFIX}${body}`;
    if (!used.has(code)) {
      used.add(code);
      return code;
    }
  }
  throw new Error("No se pudo generar un código único de jugador.");
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readJsonObject<T extends Record<string, unknown>>(
  admin: SupabaseClient,
  path: string,
): Promise<T> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(path);
  if (error || !data) return {} as T;
  try {
    const parsed = JSON.parse(await data.text()) as T;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {} as T;
    return parsed;
  } catch {
    return {} as T;
  }
}

async function writeJsonObject(
  admin: SupabaseClient,
  path: string,
  value: unknown,
) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(value)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(path, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

function normalizeCodeMap(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, code] of Object.entries(raw)) {
    const normalized = normalizePublicCode(typeof code === "string" ? code : null);
    if (id && normalized) out[id] = normalized;
  }
  return out;
}

export async function readPlayerPublicCodeMap(
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  return normalizeCodeMap(await readJsonObject(admin, PLAYER_CODES));
}

async function writePlayerPublicCodeMap(
  admin: SupabaseClient,
  map: Record<string, string>,
) {
  await writeJsonObject(admin, PLAYER_CODES, map);
}

export async function readVisoriaPublicCodeMap(
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  return normalizeCodeMap(await readJsonObject(admin, VISORIA_CODES));
}

async function writeVisoriaPublicCodeMap(
  admin: SupabaseClient,
  map: Record<string, string>,
) {
  await writeJsonObject(admin, VISORIA_CODES, map);
}

async function readTutorPublicCodeMap(
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(ROSTER);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text()) as Array<{
      id?: string;
      public_code?: string;
    }>;
    if (!Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const child of parsed) {
      const id = child.id?.trim();
      const code = normalizePublicCode(child.public_code);
      if (id && code) out[id] = code;
    }
    return out;
  } catch {
    return {};
  }
}

export async function readPublicCodeRegistry(
  admin: SupabaseClient,
): Promise<PublicCodeRegistry> {
  const raw = await readJsonObject<Record<string, PublicCodeRegistryEntry>>(
    admin,
    REGISTRY,
  );
  const out: PublicCodeRegistry = {};
  for (const [codeRaw, entry] of Object.entries(raw)) {
    const code = normalizePublicCode(codeRaw);
    if (!code || !entry || typeof entry !== "object") continue;
    if (!entry.kind || !entry.id) continue;
    out[code] = {
      kind: entry.kind,
      id: String(entry.id),
      updated_at: String(entry.updated_at ?? new Date().toISOString()),
    };
  }
  return out;
}

async function writePublicCodeRegistry(
  admin: SupabaseClient,
  registry: PublicCodeRegistry,
) {
  await writeJsonObject(admin, REGISTRY, registry);
}

/**
 * Une plantel + tutor + visorías + registro global.
 * Un código solo puede existir una vez en todo MiFicha.
 */
export async function collectUsedPublicCodes(
  admin: SupabaseClient,
): Promise<Set<string>> {
  const [players, visoria, tutors, registry] = await Promise.all([
    readPlayerPublicCodeMap(admin),
    readVisoriaPublicCodeMap(admin),
    readTutorPublicCodeMap(admin),
    readPublicCodeRegistry(admin),
  ]);
  return new Set<string>([
    ...Object.values(players),
    ...Object.values(visoria),
    ...Object.values(tutors),
    ...Object.keys(registry),
  ]);
}

/** Reconstruye el registro global desde las fuentes actuales (idempotente). */
export async function rebuildPublicCodeRegistry(
  admin: SupabaseClient,
): Promise<{ total: number; collisions: string[] }> {
  const [players, visoria, tutors] = await Promise.all([
    readPlayerPublicCodeMap(admin),
    readVisoriaPublicCodeMap(admin),
    readTutorPublicCodeMap(admin),
  ]);
  const registry: PublicCodeRegistry = {};
  const collisions: string[] = [];
  const now = new Date().toISOString();

  const claim = (code: string, kind: PublicCodeOwnerKind, id: string) => {
    const existing = registry[code];
    if (existing && (existing.kind !== kind || existing.id !== id)) {
      collisions.push(
        `${code}: ${existing.kind}:${existing.id} vs ${kind}:${id}`,
      );
      return;
    }
    registry[code] = { kind, id, updated_at: now };
  };

  for (const [id, code] of Object.entries(players)) claim(code, "player", id);
  for (const [id, code] of Object.entries(tutors)) claim(code, "tutor", id);
  for (const [id, code] of Object.entries(visoria)) claim(code, "visoria", id);

  await writePublicCodeRegistry(admin, registry);
  return { total: Object.keys(registry).length, collisions };
}

async function registerPublicCode(
  admin: SupabaseClient,
  code: string,
  kind: PublicCodeOwnerKind,
  id: string,
  registry?: PublicCodeRegistry,
) {
  const normalized = normalizePublicCode(code);
  if (!normalized) throw new Error("Código de jugador inválido.");
  const current = registry ?? (await readPublicCodeRegistry(admin));
  const existing = current[normalized];
  if (existing && (existing.kind !== kind || existing.id !== id)) {
    throw new Error(
      `El código ${normalized} ya está asignado a otro jugador (${existing.kind}).`,
    );
  }
  current[normalized] = {
    kind,
    id,
    updated_at: new Date().toISOString(),
  };
  await writePublicCodeRegistry(admin, current);
  return current;
}

async function mintAndRegister(
  admin: SupabaseClient,
  kind: PublicCodeOwnerKind,
  id: string,
  used: Set<string>,
  registry: PublicCodeRegistry,
): Promise<string> {
  const code = mintPublicCode(used);
  registry[code] = {
    kind,
    id,
    updated_at: new Date().toISOString(),
  };
  return code;
}

/** Asigna código a jugadores de plantel que aún no tienen. */
export async function ensurePlayerPublicCodes(
  admin: SupabaseClient,
  playerIds: string[],
  extraUsed: Iterable<string> = [],
): Promise<Record<string, string>> {
  const [map, used, registry] = await Promise.all([
    readPlayerPublicCodeMap(admin),
    collectUsedPublicCodes(admin),
    readPublicCodeRegistry(admin),
  ]);
  for (const code of extraUsed) {
    const normalized = normalizePublicCode(code);
    if (normalized) used.add(normalized);
  }

  let changed = false;
  let registryChanged = false;
  const result: Record<string, string> = {};

  for (const playerId of playerIds) {
    if (!playerId) continue;
    const existing = normalizePublicCode(map[playerId]);
    if (existing) {
      result[playerId] = existing;
      used.add(existing);
      if (!registry[existing] || registry[existing]?.id !== playerId) {
        registry[existing] = {
          kind: "player",
          id: playerId,
          updated_at: new Date().toISOString(),
        };
        registryChanged = true;
      }
      continue;
    }
    const code = await mintAndRegister(admin, "player", playerId, used, registry);
    map[playerId] = code;
    result[playerId] = code;
    changed = true;
    registryChanged = true;
  }

  if (changed) await writePlayerPublicCodeMap(admin, map);
  if (registryChanged) await writePublicCodeRegistry(admin, registry);
  return result;
}

/** Códigos MF-… para inscritos a visorías (mismo espacio global). */
export async function ensureVisoriaPublicCodes(
  admin: SupabaseClient,
  registrationIds: string[],
  extraUsed: Iterable<string> = [],
): Promise<Record<string, string>> {
  const [map, used, registry] = await Promise.all([
    readVisoriaPublicCodeMap(admin),
    collectUsedPublicCodes(admin),
    readPublicCodeRegistry(admin),
  ]);
  for (const code of extraUsed) {
    const normalized = normalizePublicCode(code);
    if (normalized) used.add(normalized);
  }

  let changed = false;
  let registryChanged = false;
  const result: Record<string, string> = {};

  for (const id of registrationIds) {
    if (!id) continue;
    const existing = normalizePublicCode(map[id]);
    if (existing) {
      result[id] = existing;
      used.add(existing);
      if (!registry[existing] || registry[existing]?.id !== id) {
        registry[existing] = {
          kind: "visoria",
          id,
          updated_at: new Date().toISOString(),
        };
        registryChanged = true;
      }
      continue;
    }
    const code = await mintAndRegister(admin, "visoria", id, used, registry);
    map[id] = code;
    result[id] = code;
    changed = true;
    registryChanged = true;
  }

  if (changed) await writeVisoriaPublicCodeMap(admin, map);
  if (registryChanged) await writePublicCodeRegistry(admin, registry);
  return result;
}

/**
 * Reserva códigos para fichas tutor.
 * Devuelve mapa childId → código (crea los que falten).
 */
export async function ensureTutorPublicCodes(
  admin: SupabaseClient,
  childIds: string[],
  preferredByChild: Record<string, string | null | undefined> = {},
): Promise<Record<string, string>> {
  const [used, registry] = await Promise.all([
    collectUsedPublicCodes(admin),
    readPublicCodeRegistry(admin),
  ]);
  const result: Record<string, string> = {};
  let registryChanged = false;

  for (const childId of childIds) {
    if (!childId) continue;
    const preferred = normalizePublicCode(preferredByChild[childId] ?? null);
    if (preferred) {
      const owner = registry[preferred];
      // Libre, ya de este tutor, o código de visoría del mismo jugador → unificar.
      const canAdopt =
        !owner ||
        (owner.kind === "tutor" && owner.id === childId) ||
        owner.kind === "visoria";
      if (canAdopt) {
        result[childId] = preferred;
        used.add(preferred);
        if (!owner || owner.kind === "visoria" || owner.id !== childId) {
          registry[preferred] = {
            kind: "tutor",
            id: childId,
            updated_at: new Date().toISOString(),
          };
          registryChanged = true;
        }
        continue;
      }
    }
    // Si ya está en el registro como este tutor, reutilizar.
    const existingEntry = Object.entries(registry).find(
      ([, entry]) => entry.kind === "tutor" && entry.id === childId,
    );
    if (existingEntry) {
      result[childId] = existingEntry[0];
      used.add(existingEntry[0]);
      continue;
    }
    const code = await mintAndRegister(admin, "tutor", childId, used, registry);
    result[childId] = code;
    registryChanged = true;
  }

  if (registryChanged) await writePublicCodeRegistry(admin, registry);
  return result;
}

/** Unifica el mismo código entre ficha tutor y jugador de academia. */
export async function bindPlayerPublicCode(
  admin: SupabaseClient,
  playerId: string,
  preferredCode: string,
  extraUsed: Iterable<string> = [],
): Promise<string> {
  const preferred = normalizePublicCode(preferredCode);
  const [map, used, registry] = await Promise.all([
    readPlayerPublicCodeMap(admin),
    collectUsedPublicCodes(admin),
    readPublicCodeRegistry(admin),
  ]);
  for (const code of extraUsed) {
    const normalized = normalizePublicCode(code);
    if (normalized) used.add(normalized);
  }

  const current = normalizePublicCode(map[playerId]);
  if (current) {
    await registerPublicCode(admin, current, "player", playerId, registry);
    return current;
  }

  if (preferred) {
    const owner = registry[preferred];
    const freeOrMine =
      !owner || (owner.kind === "player" && owner.id === playerId) || owner.kind === "tutor";
    // Tutor y player pueden compartir el mismo código al ligarse.
    if (freeOrMine || !used.has(preferred) || owner?.kind === "tutor") {
      map[playerId] = preferred;
      await writePlayerPublicCodeMap(admin, map);
      registry[preferred] = {
        kind: "player",
        id: playerId,
        updated_at: new Date().toISOString(),
      };
      await writePublicCodeRegistry(admin, registry);
      return preferred;
    }
  }

  const minted = await mintAndRegister(admin, "player", playerId, used, registry);
  map[playerId] = minted;
  await writePlayerPublicCodeMap(admin, map);
  await writePublicCodeRegistry(admin, registry);
  return minted;
}
