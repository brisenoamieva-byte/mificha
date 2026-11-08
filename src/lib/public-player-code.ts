import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const OPS_BUCKET = "mificha-ops";
const PLAYER_CODES = "families/player-public-codes.json";

/** Sin 0/O/1/I/L para dictarlo por WhatsApp. */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export const PUBLIC_CODE_PREFIX = "MF-";

/** MF- + 4 chars (distinto del folio de pedido MF- + 6 hex). */
export function isPublicCodeFormat(raw: string) {
  return /^MF-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/i.test(raw.trim());
}

export function normalizePublicCode(raw: string | null | undefined): string | null {
  const clean = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!isPublicCodeFormat(clean)) return null;
  return clean;
}

export function mintPublicCode(used: Set<string>): string {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let body = "";
    const bytes = randomBytes(4);
    for (let i = 0; i < 4; i += 1) {
      body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    }
    const code = `${PUBLIC_CODE_PREFIX}${body}`;
    if (!used.has(code)) {
      used.add(code);
      return code;
    }
  }
  throw new Error("No se pudo generar un código de jugador.");
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

export async function readPlayerPublicCodeMap(
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(PLAYER_CODES);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text()) as Record<string, string>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [playerId, code] of Object.entries(parsed)) {
      const normalized = normalizePublicCode(code);
      if (playerId && normalized) out[playerId] = normalized;
    }
    return out;
  } catch {
    return {};
  }
}

async function writePlayerPublicCodeMap(
  admin: SupabaseClient,
  map: Record<string, string>,
) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(map)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(PLAYER_CODES, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

/** Asigna código a jugadores de plantel que aún no tienen. */
export async function ensurePlayerPublicCodes(
  admin: SupabaseClient,
  playerIds: string[],
  extraUsed: Iterable<string> = [],
): Promise<Record<string, string>> {
  const map = await readPlayerPublicCodeMap(admin);
  const used = new Set<string>([
    ...Object.values(map),
    ...Array.from(extraUsed).map((code) => normalizePublicCode(code)).filter(Boolean) as string[],
  ]);
  let changed = false;
  const result: Record<string, string> = {};

  for (const playerId of playerIds) {
    if (!playerId) continue;
    const existing = normalizePublicCode(map[playerId]);
    if (existing) {
      result[playerId] = existing;
      used.add(existing);
      continue;
    }
    const code = mintPublicCode(used);
    map[playerId] = code;
    result[playerId] = code;
    changed = true;
  }

  if (changed) await writePlayerPublicCodeMap(admin, map);
  return result;
}

const VISORIA_CODES = "visorias/public-codes.json";

export async function readVisoriaPublicCodeMap(
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(VISORIA_CODES);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text()) as Record<string, string>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [id, code] of Object.entries(parsed)) {
      const normalized = normalizePublicCode(code);
      if (id && normalized) out[id] = normalized;
    }
    return out;
  } catch {
    return {};
  }
}

async function writeVisoriaPublicCodeMap(
  admin: SupabaseClient,
  map: Record<string, string>,
) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(map)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(VISORIA_CODES, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

/** Códigos MF-XXXX para inscritos a visorías (mismo formato que plantel/tutor). */
export async function ensureVisoriaPublicCodes(
  admin: SupabaseClient,
  registrationIds: string[],
  extraUsed: Iterable<string> = [],
): Promise<Record<string, string>> {
  const map = await readVisoriaPublicCodeMap(admin);
  const playerMap = await readPlayerPublicCodeMap(admin);
  const used = new Set<string>([
    ...Object.values(map),
    ...Object.values(playerMap),
    ...Array.from(extraUsed)
      .map((code) => normalizePublicCode(code))
      .filter((code): code is string => Boolean(code)),
  ]);
  let changed = false;
  const result: Record<string, string> = {};

  for (const id of registrationIds) {
    if (!id) continue;
    const existing = normalizePublicCode(map[id]);
    if (existing) {
      result[id] = existing;
      used.add(existing);
      continue;
    }
    const code = mintPublicCode(used);
    map[id] = code;
    result[id] = code;
    changed = true;
  }

  if (changed) await writeVisoriaPublicCodeMap(admin, map);
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
  const map = await readPlayerPublicCodeMap(admin);
  const current = normalizePublicCode(map[playerId]);
  const canonical = current || preferred;
  if (!canonical) {
    const used = new Set<string>([
      ...Object.values(map),
      ...Array.from(extraUsed).map((code) => normalizePublicCode(code)).filter(Boolean) as string[],
    ]);
    const minted = mintPublicCode(used);
    map[playerId] = minted;
    await writePlayerPublicCodeMap(admin, map);
    return minted;
  }
  if (map[playerId] !== canonical) {
    map[playerId] = canonical;
    await writePlayerPublicCodeMap(admin, map);
  }
  return canonical;
}
