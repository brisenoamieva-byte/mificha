import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyOrders, type FamilyOrderRow } from "@/lib/family-orders";
import {
  claimNui,
  normalizeNui,
  releaseNui,
} from "@/lib/player-nui";
import {
  collectUsedPublicCodes,
  ensureTutorPublicCodes,
  mintPublicCode,
  normalizePublicCode,
  releaseTutorPublicCode,
} from "@/lib/public-player-code";
import {
  normalizeMemberships,
  syncLegacyLinkFields,
  type TutorMembership,
} from "@/lib/tutor-memberships";
import {
  assertTutorVideoQuota,
  TUTOR_VIDEO_QUOTA_BYTES,
} from "@/lib/tutor-media-limits";
import {
  PRIVACY_COPY,
  TUTOR_EXPLORE_CONSENT_VERSION,
  type TutorExploreConsentEvidence,
} from "@/lib/privacy";

export type { TutorMembership, TutorExploreConsentEvidence };

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";
const MATERIALS = "families/materials.json";
const SEASONS = "families/tutor-seasons.json";

/** Piloto gratuito: sin cobro de $1,200. Apagar cuando se active la membresía. */
export const TUTOR_PILOT_FREE = true;
export const TUTOR_PILOT_LABEL =
  "Ficha + seguimiento + visibilidad ante agentes · lo único que se paga ahora es el diagnóstico GPH";

export type TutorMaterialKind = "photo" | "video" | "story";

/** Quién arma la ficha: tutor o agente (representante). */
export type GuardianKind = "tutor" | "agente";

export function normalizeGuardianKind(
  value: string | null | undefined,
): GuardianKind {
  return value === "agente" ? "agente" : "tutor";
}

export interface TutorChildProfile {
  birth_date: string | null;
  position: string | null;
  club: string | null;
  school: string | null;
  city: string | null;
  /** Estado de la República (INEGI / catálogo México). */
  state: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  nationality: string | null;
  /** NUI federado (GASER), ligado al MF- del jugador. */
  nui: string | null;
  dominant_foot: "left" | "right" | "both" | null;
  bio: string | null;
  goals: string | null;
  /** Highlights / reel (YouTube u otro). */
  youtube_url: string | null;
  /** Perfil Transfermarkt u otro marketplace. */
  transfermarkt_url: string | null;
  /** Ej. "Jugadora de fútbol profesional". */
  role_title: string | null;
  /** Frase corta bajo el nombre / “en una frase”. */
  tagline: string | null;
  contact_email: string | null;
  /** WhatsApp público (solo si show_contact_whatsapp). */
  contact_whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  /** Publicar correo en la ficha (opt-in). */
  show_contact_email: boolean;
  /** Publicar WhatsApp en la ficha (opt-in). */
  show_contact_whatsapp: boolean;
  /** Mostrar CTA hacia la academia ligada (opt-in). */
  show_contact_academy: boolean;
  /** Chips de hitos (máx. 4), ej. "Campeona Europa 2024". */
  highlight_chips: string[];
  /** Logros: club/torneo + detalle. */
  achievements: Array<{ title: string; detail: string }>;
  /** Convocatorias / selección. */
  callups: Array<{ level: string; detail: string }>;
}

export interface TutorChild {
  id: string;
  guardian_user_id: string;
  guardian_email: string;
  guardian_phone: string | null;
  /** Default tutor si falta (fichas antiguas). */
  guardian_kind?: GuardianKind;
  player_name: string;
  membership_until: string | null;
  source_folios: string[];
  share_token: string;
  /** Código corto visible (ej. MF-A3K9), mismo en tutor y academia. */
  public_code: string;
  profile: TutorChildProfile;
  created_at: string;
  /**
   * Membresías activas (N academias / planteles).
   * linked_* legacy = membresía primaria (primera), para compat.
   */
  memberships: TutorMembership[];
  /** @deprecated Preferir memberships; se mantiene sincronizado. */
  linked_player_id: string | null;
  linked_academy_id: string | null;
  linked_academy_name: string | null;
  linked_player_slug: string | null;
  linked_at: string | null;
  /**
   * Opt-in explícito: si es true, la ficha puede listarse en /fut/explorar.
   * El link /fut/f/… sigue funcionando aunque esté en false.
   */
  explore_opt_in: boolean;
  explore_opt_in_at: string | null;
  /** Evidencia de la última firma de consentimiento (se conserva al revocar). */
  explore_consent_evidence?: TutorExploreConsentEvidence | null;
}

export function childGuardianKind(child: Pick<TutorChild, "guardian_kind">): GuardianKind {
  return normalizeGuardianKind(child.guardian_kind);
}

/** Quiénes de guardian_kind tiene este usuario (roster). */
export async function listGuardianKindsForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<GuardianKind[]> {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  const kinds = new Set<GuardianKind>();
  for (const child of roster) {
    if (child.guardian_user_id !== userId) continue;
    kinds.add(childGuardianKind(child));
  }
  return [...kinds];
}

export interface TutorMaterial {
  id: string;
  child_id: string;
  guardian_user_id: string;
  kind: TutorMaterialKind;
  title: string;
  body: string | null;
  storage_path: string | null;
  /** Tamaño del archivo en bytes (para cuota de video). */
  byte_size?: number | null;
  created_at: string;
  /** Foto principal del hero. */
  is_cover?: boolean;
  /** Video que aparece primero en la ficha. */
  is_featured?: boolean;
}

export type TutorChildInput = {
  player_name: string;
  /** Si el tutor ya tiene MF- de academia/visoría, se intenta adoptar. */
  public_code?: string | null;
  guardian_phone?: string | null;
  guardian_kind?: GuardianKind;
  birth_date?: string | null;
  position?: string | null;
  club?: string | null;
  school?: string | null;
  city?: string | null;
  state?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  nationality?: string | null;
  nui?: string | null;
  dominant_foot?: "left" | "right" | "both" | null;
  bio?: string | null;
  goals?: string | null;
  youtube_url?: string | null;
  transfermarkt_url?: string | null;
  role_title?: string | null;
  tagline?: string | null;
  contact_email?: string | null;
  contact_whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  show_contact_email?: boolean;
  show_contact_whatsapp?: boolean;
  show_contact_academy?: boolean;
  highlight_chips?: string[];
  achievements?: Array<{ title: string; detail: string }>;
  callups?: Array<{ level: string; detail: string }>;
};

function phoneKey(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "";
}

function nameKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyProfile(): TutorChildProfile {
  return {
    birth_date: null,
    position: null,
    club: null,
    school: null,
    city: null,
    state: null,
    height_cm: null,
    weight_kg: null,
    nationality: null,
    nui: null,
    dominant_foot: null,
    bio: null,
    goals: null,
    youtube_url: null,
    transfermarkt_url: null,
    role_title: null,
    tagline: null,
    contact_email: null,
    contact_whatsapp: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    show_contact_email: false,
    show_contact_whatsapp: false,
    show_contact_academy: false,
    highlight_chips: [],
    achievements: [],
    callups: [],
  };
}

function cleanUrl(value: string | null | undefined) {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Handle o URL de red social → valor limpio para guardar. */
function cleanSocialHandle(value: string | null | undefined) {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.replace(/^@/, "") || null;
}

function normalizeStringList(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeNamedPairs(
  value: unknown,
  titleKey: "title" | "level",
  limit = 12,
): Array<{ title: string; detail: string } | { level: string; detail: string }> {
  if (!Array.isArray(value)) return [];
  const rows: Array<Record<string, string>> = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const title = String(row[titleKey] ?? row.title ?? row.level ?? "").trim();
    const detail = String(row.detail ?? "").trim();
    if (!title && !detail) continue;
    rows.push({ [titleKey]: title || "—", detail: detail || "—" });
    if (rows.length >= limit) break;
  }
  return rows as Array<{ title: string; detail: string } | { level: string; detail: string }>;
}

export function parseLinesToList(text: string | null | undefined, limit = 8) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

/** "Club | detalle" por línea. */
export function parseTitleDetailLines(text: string | null | undefined, limit = 12) {
  return parseLinesToList(text, limit).map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    if (parts.length >= 2) {
      return { title: parts[0] || "—", detail: parts.slice(1).join(" | ") || "—" };
    }
    return { title: line, detail: "" };
  });
}

function newShareToken() {
  return randomBytes(12).toString("hex");
}

function normalizeChild(raw: TutorChild): TutorChild {
  const merged = {
    ...emptyProfile(),
    ...(raw.profile ?? {}),
  };
  return {
    ...raw,
    share_token: raw.share_token || newShareToken(),
    public_code: normalizePublicCode(raw.public_code) ?? "",
    profile: {
      ...merged,
      nui: normalizeNui(merged.nui) ?? null,
      contact_whatsapp: phoneKey(merged.contact_whatsapp) || null,
      show_contact_email: Boolean(merged.show_contact_email),
      show_contact_whatsapp: Boolean(merged.show_contact_whatsapp),
      show_contact_academy: Boolean(merged.show_contact_academy),
      highlight_chips: normalizeStringList(merged.highlight_chips, 4),
      achievements: normalizeNamedPairs(merged.achievements, "title", 12) as Array<{
        title: string;
        detail: string;
      }>,
      callups: normalizeNamedPairs(merged.callups, "level", 12) as Array<{
        level: string;
        detail: string;
      }>,
    },
    ...syncLegacyLinkFields(normalizeMemberships(raw)),
    explore_opt_in: Boolean(raw.explore_opt_in),
    explore_opt_in_at: raw.explore_opt_in_at ?? null,
    explore_consent_evidence: raw.explore_consent_evidence ?? null,
  };
}

function profileFromInput(input: TutorChildInput): TutorChildProfile {
  return {
    birth_date: input.birth_date?.trim() || null,
    position: input.position?.trim() || null,
    club: input.club?.trim() || null,
    school: input.school?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim() || null,
    height_cm: input.height_cm ?? null,
    weight_kg: input.weight_kg ?? null,
    nationality: input.nationality?.trim() || null,
    nui: normalizeNui(input.nui) ?? null,
    dominant_foot: input.dominant_foot ?? null,
    bio: input.bio?.trim() || null,
    goals: input.goals?.trim() || null,
    youtube_url: cleanUrl(input.youtube_url),
    transfermarkt_url: cleanUrl(input.transfermarkt_url),
    role_title: input.role_title?.trim() || null,
    tagline: input.tagline?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    contact_whatsapp: phoneKey(input.contact_whatsapp) || null,
    instagram: cleanSocialHandle(input.instagram),
    facebook: cleanSocialHandle(input.facebook),
    tiktok: cleanSocialHandle(input.tiktok),
    show_contact_email: Boolean(input.show_contact_email),
    show_contact_whatsapp: Boolean(input.show_contact_whatsapp),
    show_contact_academy: Boolean(input.show_contact_academy),
    highlight_chips: normalizeStringList(input.highlight_chips, 4),
    achievements: normalizeNamedPairs(input.achievements, "title", 12) as Array<{
      title: string;
      detail: string;
    }>,
    callups: normalizeNamedPairs(input.callups, "level", 12) as Array<{
      level: string;
      detail: string;
    }>,
  };
}

async function assignMissingPublicCodes(
  admin: SupabaseClient,
  roster: TutorChild[],
): Promise<{
  roster: TutorChild[];
  changed: boolean;
}> {
  const missing = roster.filter((child) => !normalizePublicCode(child.public_code));
  if (missing.length === 0) return { roster, changed: false };

  const preferred: Record<string, string | null | undefined> = {};
  for (const child of roster) {
    preferred[child.id] = child.public_code;
  }
  const assigned = await ensureTutorPublicCodes(
    admin,
    roster.map((child) => child.id),
    preferred,
  );
  let changed = false;
  const next = roster.map((child) => {
    const code = assigned[child.id];
    if (!code || normalizePublicCode(child.public_code) === code) return child;
    changed = true;
    return { ...child, public_code: code };
  });
  return { roster: next, changed };
}

async function loadRoster(admin: SupabaseClient): Promise<{
  roster: TutorChild[];
  changed: boolean;
}> {
  const base = (await readJson<TutorChild>(admin, ROSTER)).map(normalizeChild);
  return assignMissingPublicCodes(admin, base);
}

/** Solo ops/socios: listado completo de fichas persona (sin filtrar por usuario). */
export async function listAllTutorChildrenForOps(admin: SupabaseClient) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return [...roster].sort((a, b) => a.player_name.localeCompare(b.player_name, "es"));
}

export function membershipIsActive(until: string | null | undefined) {
  if (TUTOR_PILOT_FREE) return true;
  if (!until) return false;
  return until.slice(0, 10) >= todayIso();
}

export function tutorSharePath(token: string) {
  return `/fut/f/${token}`;
}

/** Atajos para capturar torneos sin pensar el nombre desde cero. */
export const TUTOR_TOURNAMENT_PRESETS = [
  "Liga Municipal Querétaro",
  "Liga Estatal Querétaro",
  "Copa IDA",
  "Torneo escolar",
  "Amistosos / invitacionales",
] as const;

export function defaultTutorSeasonLabel(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 7 ? `Apertura ${year}` : `Clausura ${year}`;
}

/** Posiciones más usadas en ficha de tutor (texto libre almacenado). */
export const TUTOR_POSITION_OPTIONS = [
  "Portero",
  "Defensa central",
  "Lateral derecho",
  "Lateral izquierdo",
  "Mediocampista defensivo",
  "Mediocampista",
  "Mediocampista ofensivo",
  "Extremo derecho",
  "Extremo izquierdo",
  "Delantero",
] as const;

/** @deprecated Preferir MexicoLocationSelect (estado → municipio). */
export const TUTOR_CITY_OPTIONS = [
  "Querétaro",
  "Corregidora",
  "El Marqués",
  "San Juan del Río",
  "Tequisquiapan",
  "Celaya",
  "Irapuato",
  "León",
  "San Luis Potosí",
  "Guanajuato",
  "Morelia",
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Toluca",
  "Otra",
] as const;

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readJson<T>(admin: SupabaseClient, path: string): Promise<T[]> {
  // JSON muta seguido: sin cache-bust, Storage/CDN puede devolver la versión vieja
  // (p. ej. Eliminar torneo “no hace nada” porque el reload relee el archivo cacheado).
  const { data, error } = await admin.storage
    .from(OPS_BUCKET)
    .download(path, { cacheNonce: String(Date.now()) }, { cache: "no-store" });
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson(admin: SupabaseClient, path: string, rows: unknown[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage.from(OPS_BUCKET).upload(path, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
}

function orderMatchesGuardian(order: FamilyOrderRow, email: string, phone: string) {
  if (order.status !== "paid") return false;
  if (!TUTOR_PILOT_FREE && !membershipIsActive(order.membership_until)) return false;
  const orderEmail = (order.payer_email ?? "").trim().toLowerCase();
  const orderPhone = phoneKey(order.payer_phone);
  if (email && orderEmail && orderEmail === email) return true;
  if (phone && orderPhone && orderPhone === phone) return true;
  return false;
}

function assertCanUpload(child: TutorChild) {
  if (membershipIsActive(child.membership_until)) return;
  throw new Error("La membresía no está vigente. Paga el año para subir material.");
}

export async function syncTutorChildren(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  phoneRaw: string | null,
) {
  const email = (user.email ?? "").trim().toLowerCase();
  const phone = phoneKey(phoneRaw);
  const orders = await listFamilyOrders(admin);
  const matched = orders.filter((order) => orderMatchesGuardian(order, email, phone));
  const loaded = await loadRoster(admin);
  let roster = loaded.roster;
  let changed = loaded.changed;
  const usedCodes = await collectUsedPublicCodes(admin);

  for (const order of matched) {
    const playerName = (order.player_name ?? "").trim() || "Jugador";
    const key = nameKey(playerName);
    const existing = roster.find(
      (child) =>
        child.guardian_user_id === user.id && nameKey(child.player_name) === key,
    );
    if (existing) {
      if (!existing.source_folios.includes(order.folio)) {
        existing.source_folios.push(order.folio);
        changed = true;
      }
      if (
        order.membership_until &&
        (!existing.membership_until || order.membership_until > existing.membership_until)
      ) {
        existing.membership_until = order.membership_until;
        changed = true;
      }
      if (email && existing.guardian_email !== email) {
        existing.guardian_email = email;
        changed = true;
      }
      if (phone && existing.guardian_phone !== phone) {
        existing.guardian_phone = phone;
        changed = true;
      }
      continue;
    }
    const childId = randomUUID();
    const codes = await ensureTutorPublicCodes(admin, [childId]);
    const publicCode = codes[childId] ?? mintPublicCode(usedCodes);
    usedCodes.add(publicCode);
    roster.unshift({
      id: childId,
      guardian_user_id: user.id,
      guardian_email: email,
      guardian_phone: phone || null,
      player_name: playerName,
      membership_until: order.membership_until,
      source_folios: [order.folio],
      share_token: newShareToken(),
      public_code: publicCode,
      profile: emptyProfile(),
      created_at: new Date().toISOString(),
      memberships: [],
      linked_player_id: null,
      linked_academy_id: null,
      linked_academy_name: null,
      linked_player_slug: null,
      linked_at: null,
      explore_opt_in: false,
      explore_opt_in_at: null,
    });
    changed = true;
  }

  // Inscritos a visorías con el mismo WhatsApp → ficha tutor (sin meterlos a plantel).
  if (phone) {
    const { listVisoriaRegistrations } = await import("@/lib/visoria-server");
    const { VISORIA_POSITIONS } = await import("@/lib/visoria-event");
    const regs = await listVisoriaRegistrations(admin).catch(() => []);
    const matchedRegs = regs.filter(
      (row) => phoneKey(row.guardian_phone) === phone,
    );
    for (const reg of matchedRegs) {
      const playerName = (reg.player_full_name ?? "").trim();
      if (playerName.length < 2) continue;
      const key = nameKey(playerName);
      const existing =
        roster.find(
          (child) =>
            child.guardian_user_id === user.id && nameKey(child.player_name) === key,
        ) ??
        roster.find(
          (child) =>
            isPendingVisoriaGuardian(child.guardian_user_id) &&
            nameKey(child.player_name) === key &&
            phoneKey(child.guardian_phone) === phone,
        );
      const positionLabel =
        VISORIA_POSITIONS.find((item) => item.value === reg.position)?.label ??
        reg.position;
      const preferredCode = normalizePublicCode(reg.public_code);
      if (existing) {
        if (isPendingVisoriaGuardian(existing.guardian_user_id)) {
          existing.guardian_user_id = user.id;
          changed = true;
        }
        if (reg.folio && !existing.source_folios.includes(reg.folio)) {
          existing.source_folios.push(reg.folio);
          changed = true;
        }
        if (!existing.guardian_phone && phone) {
          existing.guardian_phone = phone;
          changed = true;
        }
        if (reg.guardian_email && !existing.guardian_email) {
          existing.guardian_email = reg.guardian_email.trim().toLowerCase();
          changed = true;
        }
        if (preferredCode) {
          const currentCode = normalizePublicCode(existing.public_code);
          if (currentCode !== preferredCode) {
            const codes = await ensureTutorPublicCodes(admin, [existing.id], {
              [existing.id]: preferredCode,
            });
            const adopted = normalizePublicCode(codes[existing.id] ?? null);
            if (adopted === preferredCode) {
              existing.public_code = preferredCode;
              usedCodes.add(preferredCode);
              changed = true;
            }
          } else if (!currentCode) {
            existing.public_code = preferredCode;
            usedCodes.add(preferredCode);
            changed = true;
          }
        }
        const profile = existing.profile ?? emptyProfile();
        let profileChanged = false;
        if (!profile.birth_date && reg.birth_date) {
          profile.birth_date = reg.birth_date;
          profileChanged = true;
        }
        if (!profile.position && positionLabel) {
          profile.position = positionLabel;
          profileChanged = true;
        }
        if (!profile.club && reg.current_club) {
          profile.club = reg.current_club;
          profileChanged = true;
        }
        if (!profile.city && reg.city) {
          profile.city = reg.city;
          profileChanged = true;
        }
        if (profileChanged) {
          existing.profile = profile;
          changed = true;
        }
        continue;
      }

      const childId = randomUUID();
      const codes = await ensureTutorPublicCodes(admin, [childId], {
        [childId]: preferredCode,
      });
      const code = codes[childId] ?? mintPublicCode(usedCodes);
      usedCodes.add(code);

      roster.unshift({
        id: childId,
        guardian_user_id: user.id,
        guardian_email: (reg.guardian_email ?? email).trim().toLowerCase() || email,
        guardian_phone: phone,
        player_name: playerName,
        membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
        source_folios: reg.folio ? [reg.folio] : [],
        share_token: newShareToken(),
        public_code: code,
        profile: {
          ...emptyProfile(),
          birth_date: reg.birth_date || null,
          position: positionLabel || null,
          club: reg.current_club || null,
          city: reg.city || null,
        },
        created_at: new Date().toISOString(),
        memberships: [],
        linked_player_id: null,
        linked_academy_id: null,
        linked_academy_name: null,
        linked_player_slug: null,
        linked_at: null,
        explore_opt_in: false,
        explore_opt_in_at: null,
      });
      changed = true;
    }
  }

  // Persist share_token / profile / public_code backfill for older rows.
  roster = roster.map((child) => {
    if (child.guardian_user_id !== user.id) return child;
    if (!child.share_token || !child.profile || !child.public_code) {
      changed = true;
      return normalizeChild(child);
    }
    return child;
  });
  const assigned = await assignMissingPublicCodes(admin, roster);
  roster = assigned.roster;
  if (assigned.changed) changed = true;

  if (changed) await writeJson(admin, ROSTER, roster);
  return roster
    .filter((child) => child.guardian_user_id === user.id)
    .sort((a, b) => a.player_name.localeCompare(b.player_name, "es"));
}

export async function listGuardianChildren(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  phone: string | null | undefined,
  kind: GuardianKind | "all" = "all",
) {
  const children = await syncTutorChildren(admin, user, phone ?? null);
  if (kind === "all") return children;
  return children.filter((child) => childGuardianKind(child) === kind);
}

export async function createTutorChild(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  input: TutorChildInput,
) {
  const playerName = input.player_name.trim();
  if (playerName.length < 2) throw new Error("Escribe el nombre completo del jugador.");

  const kind = normalizeGuardianKind(input.guardian_kind);
  const email = (user.email ?? "").trim().toLowerCase();
  const phone = phoneKey(input.guardian_phone);
  const loaded = await loadRoster(admin);
  const roster = loaded.roster;
  const duplicate = roster.find(
    (child) =>
      child.guardian_user_id === user.id &&
      nameKey(child.player_name) === nameKey(playerName),
  );
  if (duplicate) throw new Error("Ese jugador ya está en tu cuenta.");

  const childId = randomUUID();
  const preferredCode = normalizePublicCode(input.public_code);
  const codes = await ensureTutorPublicCodes(
    admin,
    [childId],
    preferredCode ? { [childId]: preferredCode } : {},
  );
  const publicCode = codes[childId];
  if (!publicCode) throw new Error("No se pudo asignar un código único.");
  if (preferredCode && publicCode !== preferredCode) {
    throw new Error(
      `El código ${preferredCode} ya está en uso. Déjalo vacío para generar uno nuevo o verifica el MF- con la academia.`,
    );
  }

  const child: TutorChild = {
    id: childId,
    guardian_user_id: user.id,
    guardian_email: email,
    guardian_phone: phone || null,
    guardian_kind: kind,
    player_name: playerName,
    membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
    source_folios: [],
    share_token: newShareToken(),
    public_code: publicCode,
    profile: profileFromInput(input),
    created_at: new Date().toISOString(),
    memberships: [],
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
    explore_opt_in: false,
    explore_opt_in_at: null,
    explore_consent_evidence: null,
  };
  const claimedNui = await claimNui(admin, {
    nui: input.nui,
    publicCode: child.public_code,
    kind: "tutor",
    id: child.id,
  });
  child.profile.nui = claimedNui;
  await syncLinkedPlayerNui(admin, child);

  roster.unshift(child);
  await writeJson(admin, ROSTER, roster);
  return child;
}

async function syncLinkedPlayerNui(
  admin: SupabaseClient,
  child: Pick<TutorChild, "linked_player_id" | "profile" | "memberships">,
) {
  const playerIds = new Set<string>();
  if (child.linked_player_id) playerIds.add(child.linked_player_id);
  for (const membership of child.memberships ?? []) {
    if (membership.player_id) playerIds.add(membership.player_id);
  }
  if (playerIds.size === 0) return;

  const nui = normalizeNui(child.profile.nui);
  for (const playerId of playerIds) {
    const { error } = await admin
      .from("players")
      .update({ nui })
      .eq("id", playerId);
    if (error && !/nui|column/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
}

export async function updateTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  input: TutorChildInput,
) {
  const loaded = await loadRoster(admin);
  const roster = loaded.roster;
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");

  const current = roster[index];
  const playerName = input.player_name.trim() || current.player_name;
  const nextProfile = profileFromInput(input);
  const claimedNui = await claimNui(admin, {
    nui: input.nui,
    previousNui: current.profile?.nui,
    publicCode: current.public_code,
    kind: "tutor",
    id: current.id,
  });
  nextProfile.nui = claimedNui;

  const updated: TutorChild = {
    ...current,
    player_name: playerName,
    guardian_phone: phoneKey(input.guardian_phone) || current.guardian_phone,
    profile: nextProfile,
  };
  await syncLinkedPlayerNui(admin, updated);
  roster[index] = updated;
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Borra la ficha del tutor: roster, materiales, torneos y libera MF- propio. */
export async function deleteTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
) {
  const loaded = await loadRoster(admin);
  const roster = loaded.roster;
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");

  const [removed] = roster.splice(index, 1);
  await writeJson(admin, ROSTER, roster);

  const materials = await readJson<TutorMaterial>(admin, MATERIALS);
  const keepMaterials: TutorMaterial[] = [];
  const storagePaths: string[] = [];
  for (const row of materials) {
    if (row.child_id === childId && row.guardian_user_id === userId) {
      if (row.storage_path) storagePaths.push(row.storage_path);
      continue;
    }
    keepMaterials.push(row);
  }
  if (keepMaterials.length !== materials.length) {
    await writeJson(admin, MATERIALS, keepMaterials);
  }
  if (storagePaths.length > 0) {
    await admin.storage.from(OPS_BUCKET).remove(storagePaths);
  }

  const seasons = await readJson<TutorSeasonStat>(admin, SEASONS);
  const keepSeasons = seasons.filter(
    (row) => !(row.child_id === childId && row.guardian_user_id === userId),
  );
  if (keepSeasons.length !== seasons.length) {
    await writeJson(admin, SEASONS, keepSeasons);
  }

  await releaseTutorPublicCode(admin, childId, removed.public_code);
  await releaseNui(admin, {
    nui: removed.profile?.nui,
    kind: "tutor",
    id: childId,
  });
  return { ok: true as const, id: childId, player_name: removed.player_name };
}

/**
 * Borra todas las fichas persona de un usuario (sin tocar Auth ni academia).
 * Devuelve cuántas fichas se eliminaron.
 */
export async function deleteAllTutorChildrenForUser(
  admin: SupabaseClient,
  userId: string,
) {
  const { roster } = await loadRoster(admin);
  const mine = roster.filter((child) => child.guardian_user_id === userId);
  for (const child of mine) {
    await deleteTutorChild(admin, userId, child.id);
  }
  return { ok: true as const, deleted: mine.length };
}

/**
 * ¿La cuenta también opera academia / staff? Si sí, no se puede borrar Auth desde tutor.
 */
export async function personaAccountHasAcademyOrStaff(
  admin: SupabaseClient,
  userId: string,
) {
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const role = (profile as { role?: string } | null)?.role ?? null;
  if (role === "admin" || role === "scout") return true;

  const { data: owned } = await admin
    .from("academies")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (owned) return true;

  const { data: membership } = await admin
    .from("academy_members")
    .select("academy_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return Boolean(membership);
}

/**
 * Elimina cuenta persona: fichas + Auth.
 * Bloquea si también opera academia/staff (no toca plantel).
 */
export async function deletePersonaAccount(
  admin: SupabaseClient,
  userId: string,
) {
  if (await personaAccountHasAcademyOrStaff(admin, userId)) {
    throw new Error(
      "Esta cuenta también opera academia o staff. No se puede borrar aquí: escribe a hola@mificha.mx o cierra primero el panel academia.",
    );
  }

  const fichas = await deleteAllTutorChildrenForUser(admin, userId);

  await admin.from("profiles").delete().eq("id", userId);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(error.message || "No se pudo borrar la cuenta de acceso.");
  }

  return { ok: true as const, deleted_fichas: fichas.deleted };
}

function compareTutorMaterials(a: TutorMaterial, b: TutorMaterial) {
  const aCover = a.kind === "photo" && Boolean(a.is_cover);
  const bCover = b.kind === "photo" && Boolean(b.is_cover);
  if (aCover !== bCover) return aCover ? -1 : 1;

  const aFeatured = a.kind === "video" && Boolean(a.is_featured);
  const bFeatured = b.kind === "video" && Boolean(b.is_featured);
  if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;

  // Mezcla fotos/videos/notas por fecha de subida (más reciente arriba).
  return b.created_at.localeCompare(a.created_at);
}

export async function listTutorMaterials(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const mine = rows
    .filter(
      (row) => row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .sort(compareTutorMaterials);

  const withUrls = await Promise.all(
    mine.map(async (row) => {
      if (!row.storage_path) return { ...row, url: null as string | null };
      const signed = await admin.storage
        .from(OPS_BUCKET)
        .createSignedUrl(row.storage_path, 60 * 60);
      return { ...row, url: signed.data?.signedUrl ?? null };
    }),
  );
  return withUrls;
}

export async function getTutorChild(
  admin: SupabaseClient,
  userId: string,
  childId: string,
) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return (
    roster.find((child) => child.id === childId && child.guardian_user_id === userId) ??
    null
  );
}

export const getTutorChildForGuardian = getTutorChild;

export async function updateTutorChildLink(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  link: {
    linked_player_id: string | null;
    linked_academy_id: string | null;
    linked_academy_name: string | null;
    linked_player_slug: string | null;
    linked_at: string | null;
    /** Si se pasa, reemplaza el arreglo completo. */
    memberships?: TutorMembership[];
  },
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");

  const memberships =
    link.memberships ??
    normalizeMemberships({
      linked_player_id: link.linked_player_id,
      linked_academy_id: link.linked_academy_id,
      linked_academy_name: link.linked_academy_name,
      linked_player_slug: link.linked_player_slug,
      linked_at: link.linked_at,
      memberships: link.linked_player_id
        ? [
            {
              player_id: link.linked_player_id,
              academy_id: link.linked_academy_id || "",
              academy_name: link.linked_academy_name || "Academia",
              player_slug: link.linked_player_slug || "",
              linked_at: link.linked_at || new Date().toISOString(),
            },
          ]
        : [],
    });

  roster[index] = normalizeChild({
    ...roster[index],
    ...syncLegacyLinkFields(memberships),
  });
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Añade o actualiza una membresía sin borrar las demás. */
export async function addTutorChildMembership(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  membership: TutorMembership,
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const current = normalizeMemberships(roster[index]);
  const { upsertMembershipList } = await import("@/lib/tutor-memberships");
  const memberships = upsertMembershipList(current, membership);
  roster[index] = normalizeChild({
    ...roster[index],
    ...syncLegacyLinkFields(memberships),
  });
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Quita una membresía por player_id. */
export async function removeTutorChildMembership(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  playerId: string,
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const { removeMembershipByPlayer } = await import("@/lib/tutor-memberships");
  const memberships = removeMembershipByPlayer(
    normalizeMemberships(roster[index]),
    playerId,
  );
  roster[index] = normalizeChild({
    ...roster[index],
    ...syncLegacyLinkFields(memberships),
  });
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

function buildTutorExploreConsentEvidence(input: {
  userId: string;
  acceptorName: string;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  acceptedAt: string;
}): TutorExploreConsentEvidence {
  const name = input.acceptorName.trim();
  if (name.length < 3) {
    throw new Error("Escribe tu nombre completo para firmar el consentimiento.");
  }
  return {
    accepted_at: input.acceptedAt,
    acceptor_user_id: input.userId,
    acceptor_name: name,
    acceptor_email: input.email?.trim().toLowerCase() || null,
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
    consent_version: TUTOR_EXPLORE_CONSENT_VERSION,
    consent_text: PRIVACY_COPY.tutorConsentLabel,
    revoked_at: null,
  };
}

/** Activa o apaga el listado de la ficha en Explorar (opt-in firmado por el tutor). */
export async function updateTutorExploreOptIn(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  exploreOptIn: boolean,
  options?: {
    consentAck?: boolean;
    acceptorName?: string;
    email?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  },
) {
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  if (exploreOptIn && !options?.consentAck) {
    throw new Error(
      "Para publicar en Explorar debes confirmar el consentimiento parental.",
    );
  }
  const now = new Date().toISOString();
  const current = roster[index];
  if (exploreOptIn) {
    roster[index] = {
      ...current,
      explore_opt_in: true,
      explore_opt_in_at: now,
      explore_consent_evidence: buildTutorExploreConsentEvidence({
        userId,
        acceptorName: options?.acceptorName ?? "",
        email: options?.email ?? current.guardian_email,
        ip: options?.ip,
        userAgent: options?.userAgent,
        acceptedAt: now,
      }),
    };
  } else {
    const prev = current.explore_consent_evidence ?? null;
    roster[index] = {
      ...current,
      explore_opt_in: false,
      explore_opt_in_at: null,
      explore_consent_evidence: prev
        ? { ...prev, revoked_at: now }
        : prev,
    };
  }
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/**
 * El tutor aprueba la ficha pública del jugador de academia vinculado
 * (public_consent_at + link + directorio).
 */
export async function grantTutorLinkedAcademyConsent(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  options?: {
    consentAck?: boolean;
    acceptorName?: string;
    email?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  },
) {
  if (!options?.consentAck) {
    throw new Error(
      "Para aprobar la ficha de academia debes confirmar el consentimiento parental.",
    );
  }
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const child = roster[index];
  const memberships = normalizeMemberships(child);
  if (memberships.length === 0) {
    throw new Error("Este jugador aún no está vinculado a un plantel de academia.");
  }

  const now = new Date().toISOString();
  const evidence = buildTutorExploreConsentEvidence({
    userId,
    acceptorName: options?.acceptorName ?? "",
    email: options?.email ?? child.guardian_email,
    ip: options?.ip,
    userAgent: options?.userAgent,
    acceptedAt: now,
  });

  for (const membership of memberships) {
    const { error } = await admin
      .from("players")
      .update({
        public_consent_at: now,
        is_public: true,
        is_discoverable: true,
      })
      .eq("id", membership.player_id);
    if (error) throw new Error(error.message || "No se pudo guardar el consentimiento.");
  }

  roster[index] = {
    ...child,
    explore_opt_in: true,
    explore_opt_in_at: child.explore_opt_in_at ?? now,
    explore_consent_evidence: evidence,
  };
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Fija el código público del hijo tutor (p. ej. al unificar con academia). */
export async function setTutorChildPublicCode(
  admin: SupabaseClient,
  userId: string,
  childId: string,
  publicCode: string,
) {
  const code = normalizePublicCode(publicCode);
  if (!code) throw new Error("Código de jugador inválido.");
  const { roster } = await loadRoster(admin);
  const index = roster.findIndex(
    (child) => child.id === childId && child.guardian_user_id === userId,
  );
  if (index < 0) throw new Error("No encontramos a ese jugador.");
  const takenLocal = roster.find(
    (child, i) => i !== index && normalizePublicCode(child.public_code) === code,
  );
  if (takenLocal) throw new Error("Ese código ya está en uso.");

  const assigned = await ensureTutorPublicCodes(admin, [childId], {
    [childId]: code,
  });
  if (assigned[childId] !== code) {
    throw new Error("Ese código ya está en uso por otro jugador.");
  }
  roster[index] = { ...roster[index], public_code: code };
  await writeJson(admin, ROSTER, roster);
  return roster[index];
}

/** Mapa player_id → ficha tutor ligada, para una academia. */
export async function listTutorLinksByAcademy(admin: SupabaseClient, academyId: string) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  const out: Array<{
    player_id: string;
    tutor_child_id: string;
    player_name: string;
    share_token: string;
    public_code: string;
    guardian_email: string;
  }> = [];
  for (const child of roster) {
    const membership = normalizeMemberships(child).find(
      (row) => row.academy_id === academyId,
    );
    if (!membership) continue;
    out.push({
      player_id: membership.player_id,
      tutor_child_id: child.id,
      player_name: child.player_name,
      share_token: child.share_token,
      public_code: child.public_code,
      guardian_email: child.guardian_email,
    });
  }
  return out;
}

export async function listTutorPublicCodes(admin: SupabaseClient): Promise<string[]> {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return roster
    .map((child) => normalizePublicCode(child.public_code))
    .filter((code): code is string => Boolean(code));
}

function findChildByShareAccess(roster: TutorChild[], token: string) {
  const raw = token.trim();
  if (!raw) return null;
  const asCode = normalizePublicCode(raw);
  if (asCode) {
    const byCode = roster.find(
      (child) => normalizePublicCode(child.public_code) === asCode,
    );
    if (byCode) return byCode;
  }
  const clean = raw.toLowerCase();
  return roster.find((child) => child.share_token === clean) ?? null;
}

export async function getTutorChildByShareToken(admin: SupabaseClient, token: string) {
  const { roster, changed } = await loadRoster(admin);
  if (changed) await writeJson(admin, ROSTER, roster);
  return findChildByShareAccess(roster, token);
}

/** Solo lectura: para OG/metadata sin mutar códigos ni roster. */
export async function peekTutorChildByShareToken(
  admin: SupabaseClient,
  token: string,
) {
  const roster = (await readJson<TutorChild>(admin, ROSTER)).map(normalizeChild);
  return findChildByShareAccess(roster, token);
}

export async function addTutorStory(
  admin: SupabaseClient,
  child: TutorChild,
  title: string,
  body: string,
) {
  assertCanUpload(child);
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: "story",
    title: title.trim() || "Nota",
    body: body.trim(),
    storage_path: null,
    created_at: new Date().toISOString(),
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}

export async function getTutorVideoUsageBytes(
  admin: SupabaseClient,
  guardianUserId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  return rows.reduce((sum, row) => {
    if (row.guardian_user_id !== guardianUserId) return sum;
    if (row.kind !== "video") return sum;
    const size = Number(row.byte_size);
    if (!Number.isFinite(size) || size <= 0) return sum;
    return sum + size;
  }, 0);
}

export async function prepareTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  kind: "photo" | "video",
  fileName: string,
  fileSize?: number | null,
) {
  assertCanUpload(child);
  const size = Number(fileSize);
  if (kind === "video" && Number.isFinite(size) && size > 0) {
    const used = await getTutorVideoUsageBytes(admin, child.guardian_user_id);
    assertTutorVideoQuota(used, size);
  }
  await ensureOpsBucket(admin);
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "archivo";
  const storagePath = `families/${child.id}/${randomUUID()}-${safe}`;
  const signed = await admin.storage.from(OPS_BUCKET).createSignedUploadUrl(storagePath);
  if (signed.error || !signed.data) {
    throw new Error(signed.error?.message || "No se pudo preparar la carga.");
  }
  const used = await getTutorVideoUsageBytes(admin, child.guardian_user_id);
  return {
    path: storagePath,
    token: signed.data.token,
    signedUrl: signed.data.signedUrl,
    video_used_bytes: used,
    video_quota_bytes: TUTOR_VIDEO_QUOTA_BYTES,
  };
}

export async function commitTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  input: {
    kind: "photo" | "video";
    title: string;
    path: string;
    byte_size?: number | null;
  },
) {
  assertCanUpload(child);
  if (!input.path.startsWith(`families/${child.id}/`)) {
    throw new Error("Archivo inválido.");
  }
  const byteSize = Number(input.byte_size);
  const size =
    Number.isFinite(byteSize) && byteSize > 0 ? Math.round(byteSize) : null;
  if (input.kind === "video" && size) {
    const used = await getTutorVideoUsageBytes(admin, child.guardian_user_id);
    assertTutorVideoQuota(used, size);
  }
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const hasCover = rows.some(
    (row) =>
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id &&
      row.kind === "photo" &&
      row.is_cover,
  );
  const hasFeatured = rows.some(
    (row) =>
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id &&
      row.kind === "video" &&
      row.is_featured,
  );
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: input.kind,
    title: input.title.trim() || (input.kind === "photo" ? "Foto" : "Video"),
    body: null,
    storage_path: input.path,
    byte_size: size,
    created_at: new Date().toISOString(),
    is_cover: input.kind === "photo" ? !hasCover : false,
    is_featured: input.kind === "video" ? !hasFeatured : false,
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}

function ownMaterialIndex(
  rows: TutorMaterial[],
  child: TutorChild,
  materialId: string,
) {
  return rows.findIndex(
    (row) =>
      row.id === materialId &&
      row.child_id === child.id &&
      row.guardian_user_id === child.guardian_user_id,
  );
}

export async function deleteTutorMaterial(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos ese material.");
  const [removed] = rows.splice(index, 1);
  await writeJson(admin, MATERIALS, rows);

  if (removed.storage_path) {
    await admin.storage.from(OPS_BUCKET).remove([removed.storage_path]);
  }

  // Si borramos la portada/featured, promociona el más reciente del mismo tipo.
  if (removed.kind === "photo" && removed.is_cover) {
    const nextPhoto = rows
      .filter(
        (row) =>
          row.child_id === child.id &&
          row.guardian_user_id === child.guardian_user_id &&
          row.kind === "photo",
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (nextPhoto) {
      for (const row of rows) {
        if (row.child_id !== child.id || row.kind !== "photo") continue;
        row.is_cover = row.id === nextPhoto.id;
      }
      await writeJson(admin, MATERIALS, rows);
    }
  }
  if (removed.kind === "video" && removed.is_featured) {
    const nextVideo = rows
      .filter(
        (row) =>
          row.child_id === child.id &&
          row.guardian_user_id === child.guardian_user_id &&
          row.kind === "video",
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (nextVideo) {
      for (const row of rows) {
        if (row.child_id !== child.id || row.kind !== "video") continue;
        row.is_featured = row.id === nextVideo.id;
      }
      await writeJson(admin, MATERIALS, rows);
    }
  }

  return { ok: true as const, id: materialId };
}

export async function setTutorPhotoCover(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos esa foto.");
  if (rows[index].kind !== "photo") {
    throw new Error("Solo una foto puede ser portada.");
  }
  for (const row of rows) {
    if (row.child_id !== child.id || row.guardian_user_id !== child.guardian_user_id) {
      continue;
    }
    if (row.kind === "photo") row.is_cover = row.id === materialId;
  }
  await writeJson(admin, MATERIALS, rows);
  return rows[index];
}

export async function setTutorFeaturedVideo(
  admin: SupabaseClient,
  child: TutorChild,
  materialId: string,
) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const index = ownMaterialIndex(rows, child, materialId);
  if (index < 0) throw new Error("No encontramos ese video.");
  if (rows[index].kind !== "video") {
    throw new Error("Solo un video puede ser el destacado.");
  }
  for (const row of rows) {
    if (row.child_id !== child.id || row.guardian_user_id !== child.guardian_user_id) {
      continue;
    }
    if (row.kind === "video") row.is_featured = row.id === materialId;
  }
  await writeJson(admin, MATERIALS, rows);
  return rows[index];
}

/** Temporada / torneo capturado por el tutor (sin academia). */
export interface TutorSeasonStat {
  id: string;
  child_id: string;
  guardian_user_id: string;
  tournament_name: string;
  season_label: string;
  team_name: string | null;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  notes: string | null;
  /** Menor = más arriba en la ficha. */
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TutorSeasonInput = {
  tournament_name: string;
  season_label?: string;
  team_name?: string | null;
  matches?: number;
  goals?: number;
  assists?: number;
  minutes?: number;
  notes?: string | null;
};

function nonNegInt(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(Math.round(n), 99999);
}

function normalizeSeason(raw: TutorSeasonStat): TutorSeasonStat {
  const created = String(raw.created_at ?? "");
  const sortRaw = Number((raw as { sort_order?: number }).sort_order);
  return {
    ...raw,
    tournament_name: String(raw.tournament_name ?? "").trim(),
    season_label: String(raw.season_label ?? "").trim(),
    team_name: raw.team_name?.trim() || null,
    matches: nonNegInt(raw.matches),
    goals: nonNegInt(raw.goals),
    assists: nonNegInt(raw.assists),
    minutes: nonNegInt(raw.minutes),
    notes: raw.notes?.trim() || null,
    // Legacy sin sort_order: ordenar por created_at (más reciente arriba).
    sort_order: Number.isFinite(sortRaw)
      ? sortRaw
      : created
        ? -Date.parse(created) || 0
        : 0,
  };
}

function compareSeasons(a: TutorSeasonStat, b: TutorSeasonStat) {
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
  return b.created_at.localeCompare(a.created_at);
}

export async function listTutorSeasons(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  return rows
    .filter(
      (row) =>
        row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .map(normalizeSeason)
    .sort(compareSeasons);
}

export async function upsertTutorSeason(
  admin: SupabaseClient,
  child: TutorChild,
  input: TutorSeasonInput,
  seasonId?: string | null,
) {
  assertCanUpload(child);
  const tournament = input.tournament_name.trim();
  if (!tournament) throw new Error("Indica el torneo o competencia.");

  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  const now = new Date().toISOString();
  const payload = {
    tournament_name: tournament,
    season_label: (input.season_label ?? "").trim() || "Temporada actual",
    team_name: input.team_name?.trim() || null,
    matches: nonNegInt(input.matches),
    goals: nonNegInt(input.goals),
    assists: nonNegInt(input.assists),
    minutes: nonNegInt(input.minutes),
    notes: input.notes?.trim() || null,
    updated_at: now,
  };

  if (seasonId) {
    const index = rows.findIndex(
      (row) =>
        row.id === seasonId &&
        row.child_id === child.id &&
        row.guardian_user_id === child.guardian_user_id,
    );
    if (index < 0) throw new Error("No encontramos ese registro.");
    rows[index] = normalizeSeason({ ...rows[index], ...payload });
    await writeJson(admin, SEASONS, rows);
    return rows[index];
  }

  const mine = rows
    .filter(
      (row) =>
        row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .map(normalizeSeason);
  const minOrder = mine.reduce(
    (min, row) => Math.min(min, row.sort_order),
    0,
  );

  const row = normalizeSeason({
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    created_at: now,
    sort_order: minOrder - 1,
    ...payload,
  });
  rows.unshift(row);
  await writeJson(admin, SEASONS, rows);
  return row;
}

export async function reorderTutorSeasons(
  admin: SupabaseClient,
  child: TutorChild,
  orderedIds: string[],
) {
  const ids = orderedIds.map((id) => String(id ?? "").trim()).filter(Boolean);
  if (!ids.length) throw new Error("Indica el orden de los torneos.");

  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  const mine = rows.filter(
    (row) =>
      row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
  );
  const byId = new Map(mine.map((row) => [row.id, row]));
  if (ids.some((id) => !byId.has(id)) || ids.length !== mine.length) {
    throw new Error("El orden no coincide con los torneos de esta ficha.");
  }

  const now = new Date().toISOString();
  const orderMap = new Map(ids.map((id, index) => [id, index]));
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.child_id !== child.id || row.guardian_user_id !== child.guardian_user_id) {
      continue;
    }
    const sort_order = orderMap.get(row.id);
    if (sort_order == null) continue;
    rows[i] = normalizeSeason({ ...row, sort_order, updated_at: now });
  }
  await writeJson(admin, SEASONS, rows);
  return listTutorSeasons(admin, child);
}

export async function deleteTutorSeason(
  admin: SupabaseClient,
  child: TutorChild,
  seasonId: string,
) {
  const rows = await readJson<TutorSeasonStat>(admin, SEASONS);
  const next = rows.filter(
    (row) =>
      !(
        row.id === seasonId &&
        row.child_id === child.id &&
        row.guardian_user_id === child.guardian_user_id
      ),
  );
  // Idempotente: si ya no está (o la UI veía una fila fantasma por caché), OK.
  if (next.length === rows.length) {
    return { ok: true as const, id: seasonId, missing: true as const };
  }
  await writeJson(admin, SEASONS, next);
  return { ok: true as const, id: seasonId };
}

export function summarizeTutorSeasons(seasons: TutorSeasonStat[]) {
  return seasons.reduce(
    (acc, row) => ({
      matches: acc.matches + row.matches,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      minutes: acc.minutes + row.minutes,
    }),
    { matches: 0, goals: 0, assists: 0, minutes: 0 },
  );
}

export function isPendingVisoriaGuardian(guardianUserId: string) {
  return guardianUserId.startsWith("pending:visoria:");
}

/**
 * Tras registrar visoría: deja una ficha tutor mínima con el mismo MF-…
 * para que `/fut/f/{código}` ya abra algo presentable.
 */
export async function seedTutorFromVisoriaRegistration(
  admin: SupabaseClient,
  reg: {
    id: string;
    folio: string;
    player_full_name: string;
    birth_date: string | null;
    position: string | null;
    current_club: string | null;
    city: string | null;
    guardian_phone: string;
    guardian_email: string | null;
    public_code?: string | null;
    nui?: string | null;
  },
) {
  const code = normalizePublicCode(reg.public_code);
  if (!code) return null;

  const { VISORIA_POSITIONS } = await import("@/lib/visoria-event");
  const positionLabel =
    VISORIA_POSITIONS.find((item) => item.value === reg.position)?.label ??
    reg.position;

  const loaded = await loadRoster(admin);
  let roster = loaded.roster;
  let changed = loaded.changed;

  const byCode = roster.find(
    (child) => normalizePublicCode(child.public_code) === code,
  );
  if (byCode) return byCode;

  const phone = phoneKey(reg.guardian_phone);
  const key = nameKey(reg.player_full_name);
  const pendingSame = roster.find(
    (child) =>
      isPendingVisoriaGuardian(child.guardian_user_id) &&
      nameKey(child.player_name) === key &&
      phoneKey(child.guardian_phone) === phone,
  );
  if (pendingSame) {
    if (normalizePublicCode(pendingSame.public_code) !== code) {
      pendingSame.public_code = code;
      changed = true;
    }
    if (changed) await writeJson(admin, ROSTER, roster);
    return pendingSame;
  }

  const childId = randomUUID();
  await ensureTutorPublicCodes(admin, [childId], { [childId]: code });
  const child: TutorChild = {
    id: childId,
    guardian_user_id: `pending:visoria:${reg.id}`,
    guardian_email: (reg.guardian_email ?? "").trim().toLowerCase(),
    guardian_phone: phone || null,
    player_name: reg.player_full_name.trim(),
    membership_until: TUTOR_PILOT_FREE ? "2099-12-31" : null,
    source_folios: reg.folio ? [reg.folio] : [],
    share_token: newShareToken(),
    public_code: code,
    profile: {
      ...emptyProfile(),
      birth_date: reg.birth_date || null,
      position: positionLabel || null,
      club: reg.current_club || null,
      city: reg.city || null,
      nui: normalizeNui(reg.nui) ?? null,
    },
    created_at: new Date().toISOString(),
    memberships: [],
    linked_player_id: null,
    linked_academy_id: null,
    linked_academy_name: null,
    linked_player_slug: null,
    linked_at: null,
    explore_opt_in: false,
    explore_opt_in_at: null,
  };
  roster.unshift(child);
  await writeJson(admin, ROSTER, roster);
  return child;
}
