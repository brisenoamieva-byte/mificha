import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizePublicCode,
  type PublicCodeOwnerKind,
} from "@/lib/public-player-code";

const OPS_BUCKET = "mificha-ops";
const NUI_REGISTRY = "families/nui-registry.json";

export type NuiOwnerKind = PublicCodeOwnerKind;

export interface NuiRegistryEntry {
  public_code: string;
  kind: NuiOwnerKind;
  id: string;
  updated_at: string;
}

export type NuiRegistry = Record<string, NuiRegistryEntry>;

/** NUI federado (GASER): solo dígitos, 5–12. */
export function normalizeNui(raw: string | null | undefined): string | null {
  const digits = String(raw ?? "")
    .trim()
    .replace(/\D+/g, "");
  if (digits.length < 5 || digits.length > 12) return null;
  return digits;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readNuiRegistry(admin: SupabaseClient): Promise<NuiRegistry> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(NUI_REGISTRY);
  if (error || !data) return {};
  try {
    const parsed = JSON.parse(await data.text()) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: NuiRegistry = {};
    for (const [key, value] of Object.entries(parsed)) {
      const nui = normalizeNui(key);
      if (!nui || !value || typeof value !== "object" || Array.isArray(value)) continue;
      const entry = value as Partial<NuiRegistryEntry>;
      const publicCode = normalizePublicCode(entry.public_code ?? null);
      if (!publicCode || !entry.kind || !entry.id) continue;
      out[nui] = {
        public_code: publicCode,
        kind: entry.kind,
        id: String(entry.id),
        updated_at: String(entry.updated_at ?? new Date().toISOString()),
      };
    }
    return out;
  } catch {
    return {};
  }
}

async function writeNuiRegistry(admin: SupabaseClient, registry: NuiRegistry) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(registry)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(NUI_REGISTRY, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

export async function lookupNui(
  admin: SupabaseClient,
  rawNui: string | null | undefined,
): Promise<NuiRegistryEntry | null> {
  const nui = normalizeNui(rawNui);
  if (!nui) return null;
  const registry = await readNuiRegistry(admin);
  return registry[nui] ?? null;
}

/**
 * Asocia un NUI al código MF- de un dueño (tutor / plantel / visoría).
 * Si el NUI ya pertenece a otro id o a otro MF-, rechaza.
 * Si rawNui está vacío, libera el NUI previo de este dueño (si aplica).
 */
export async function claimNui(
  admin: SupabaseClient,
  opts: {
    nui: string | null | undefined;
    publicCode: string | null | undefined;
    kind: NuiOwnerKind;
    id: string;
    /** NUI anterior del mismo dueño (para liberar al cambiar/borrar). */
    previousNui?: string | null | undefined;
  },
): Promise<string | null> {
  const rawTrimmed = String(opts.nui ?? "").trim();
  const nui = normalizeNui(opts.nui);
  if (rawTrimmed && !nui) {
    throw new Error("NUI inválido. Usa solo números (5 a 12 dígitos).");
  }

  const previous = normalizeNui(opts.previousNui);
  const publicCode = normalizePublicCode(opts.publicCode);
  const ownerId = opts.id.trim();

  if (!ownerId) throw new Error("Falta el dueño del NUI.");

  const registry = await readNuiRegistry(admin);
  let changed = false;

  if (previous && previous !== nui) {
    const existingPrev = registry[previous];
    if (existingPrev && existingPrev.kind === opts.kind && existingPrev.id === ownerId) {
      delete registry[previous];
      changed = true;
    }
  }

  if (!nui) {
    if (changed) await writeNuiRegistry(admin, registry);
    return null;
  }

  if (!publicCode) {
    throw new Error("Para registrar el NUI necesitas el código MiFicha (MF-…) del jugador.");
  }

  const existing = registry[nui];
  if (existing) {
    const sameOwner = existing.kind === opts.kind && existing.id === ownerId;
    const sameCode = existing.public_code === publicCode;
    if (!sameOwner && !sameCode) {
      throw new Error(
        `El NUI ${nui} ya está ligado a otro perfil MiFicha (${existing.public_code}).`,
      );
    }
    if (sameOwner && sameCode && existing.public_code === publicCode) {
      // Idempotente.
      if (changed) await writeNuiRegistry(admin, registry);
      return nui;
    }
  }

  registry[nui] = {
    public_code: publicCode,
    kind: opts.kind,
    id: ownerId,
    updated_at: new Date().toISOString(),
  };
  await writeNuiRegistry(admin, registry);
  return nui;
}

export async function releaseNui(
  admin: SupabaseClient,
  opts: {
    nui: string | null | undefined;
    kind: NuiOwnerKind;
    id: string;
  },
): Promise<void> {
  const nui = normalizeNui(opts.nui);
  if (!nui) return;
  const registry = await readNuiRegistry(admin);
  const existing = registry[nui];
  if (!existing) return;
  if (existing.kind !== opts.kind || existing.id !== opts.id) return;
  delete registry[nui];
  await writeNuiRegistry(admin, registry);
}
