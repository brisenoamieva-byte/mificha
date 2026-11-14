import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  gphInviteEmailMailto,
  gphInviteWhatsAppHref,
  type GphInviteSegment,
} from "@/lib/gph-invite-wave";

const OPS_BUCKET = "mificha-ops";
const STORE = "ops/pilot-invite-leads.json";

export const PILOT_INVITE_STATUSES = [
  "pendiente",
  "invitado",
  "entro",
  "ficha",
  "feedback",
  "descartado",
] as const;

export type PilotInviteStatus = (typeof PILOT_INVITE_STATUSES)[number];

export const PILOT_INVITE_STATUS_LABEL: Record<PilotInviteStatus, string> = {
  pendiente: "Pendiente",
  invitado: "Invitado",
  entro: "Entró",
  ficha: "Ficha lista",
  feedback: "Con feedback",
  descartado: "Descartado",
};

export type PilotInviteLead = {
  id: string;
  wave: number;
  tutor_name: string;
  player_name: string | null;
  phone: string | null;
  email: string | null;
  segment: GphInviteSegment;
  status: PilotInviteStatus;
  channel: "whatsapp" | "email" | "ambos" | null;
  invited_at: string | null;
  reminded_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type PilotInviteInput = {
  tutor_name?: string;
  player_name?: string | null;
  phone?: string | null;
  email?: string | null;
  segment?: GphInviteSegment;
  status?: PilotInviteStatus;
  channel?: PilotInviteLead["channel"];
  notes?: string | null;
  wave?: number;
  mark_invited?: boolean;
  mark_reminded?: boolean;
};

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readLeads(admin: SupabaseClient): Promise<PilotInviteLead[]> {
  const { data, error } = await admin.storage
    .from(OPS_BUCKET)
    .download(STORE, { cacheNonce: String(Date.now()) }, { cache: "no-store" });
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as PilotInviteLead[];
    return Array.isArray(parsed) ? parsed.map(normalizeLead) : [];
  } catch {
    return [];
  }
}

async function writeLeads(admin: SupabaseClient, rows: PilotInviteLead[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage.from(OPS_BUCKET).upload(STORE, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
}

function phoneDigits(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : "";
}

function asSegment(value: unknown): GphInviteSegment {
  return value === "tibio" || value === "frio" ? value : "caliente";
}

function asStatus(value: unknown): PilotInviteStatus {
  return PILOT_INVITE_STATUSES.includes(value as PilotInviteStatus)
    ? (value as PilotInviteStatus)
    : "pendiente";
}

function asChannel(value: unknown): PilotInviteLead["channel"] {
  return value === "whatsapp" || value === "email" || value === "ambos"
    ? value
    : null;
}

function normalizeLead(raw: PilotInviteLead): PilotInviteLead {
  return {
    id: String(raw.id || randomUUID()),
    wave: Number(raw.wave) > 0 ? Math.round(Number(raw.wave)) : 1,
    tutor_name: String(raw.tutor_name ?? "").trim() || "Sin nombre",
    player_name: raw.player_name?.trim() || null,
    phone: phoneDigits(raw.phone) || null,
    email: raw.email?.trim().toLowerCase() || null,
    segment: asSegment(raw.segment),
    status: asStatus(raw.status),
    channel: asChannel(raw.channel),
    invited_at: raw.invited_at ?? null,
    reminded_at: raw.reminded_at ?? null,
    notes: raw.notes?.trim() || null,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    created_by: raw.created_by ?? null,
  };
}

export function summarizePilotInvites(leads: PilotInviteLead[]) {
  const counts = Object.fromEntries(
    PILOT_INVITE_STATUSES.map((status) => [status, 0]),
  ) as Record<PilotInviteStatus, number>;
  for (const lead of leads) counts[lead.status] += 1;
  return {
    total: leads.length,
    counts,
    invited: counts.invitado + counts.entro + counts.ficha + counts.feedback,
    activated: counts.entro + counts.ficha + counts.feedback,
    fichas: counts.ficha + counts.feedback,
  };
}

export async function listPilotInvites(admin: SupabaseClient) {
  const leads = await readLeads(admin);
  return leads.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function createPilotInvite(
  admin: SupabaseClient,
  input: PilotInviteInput,
  createdBy?: string | null,
) {
  const tutor = String(input.tutor_name ?? "").trim();
  if (tutor.length < 2) throw new Error("Escribe el nombre del tutor.");

  const now = new Date().toISOString();
  const markInvited = Boolean(input.mark_invited);
  const lead = normalizeLead({
    id: randomUUID(),
    wave: input.wave ?? 1,
    tutor_name: tutor,
    player_name: input.player_name ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    segment: input.segment ?? "caliente",
    status: markInvited ? "invitado" : input.status ?? "pendiente",
    channel: input.channel ?? null,
    invited_at: markInvited ? now : null,
    reminded_at: null,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
    created_by: createdBy ?? null,
  });

  const rows = await readLeads(admin);
  rows.unshift(lead);
  await writeLeads(admin, rows);
  return lead;
}

export async function updatePilotInvite(
  admin: SupabaseClient,
  leadId: string,
  input: PilotInviteInput,
) {
  const rows = await readLeads(admin);
  const index = rows.findIndex((row) => row.id === leadId);
  if (index < 0) throw new Error("No encontramos ese contacto.");

  const current = rows[index];
  const now = new Date().toISOString();
  let status = input.status ? asStatus(input.status) : current.status;
  let invitedAt = current.invited_at;
  let remindedAt = current.reminded_at;

  if (input.mark_invited) {
    invitedAt = invitedAt ?? now;
    if (status === "pendiente") status = "invitado";
  }
  if (input.mark_reminded) {
    remindedAt = now;
  }

  const next = normalizeLead({
    ...current,
    tutor_name:
      input.tutor_name != null ? String(input.tutor_name) : current.tutor_name,
    player_name:
      input.player_name !== undefined
        ? input.player_name
        : current.player_name,
    phone: input.phone !== undefined ? input.phone : current.phone,
    email: input.email !== undefined ? input.email : current.email,
    segment: input.segment ?? current.segment,
    status,
    channel: input.channel !== undefined ? input.channel : current.channel,
    notes: input.notes !== undefined ? input.notes : current.notes,
    wave: input.wave ?? current.wave,
    invited_at: invitedAt,
    reminded_at: remindedAt,
    updated_at: now,
  });

  rows[index] = next;
  await writeLeads(admin, rows);
  return next;
}

export async function deletePilotInvite(admin: SupabaseClient, leadId: string) {
  const rows = await readLeads(admin);
  const next = rows.filter((row) => row.id !== leadId);
  if (next.length === rows.length) throw new Error("No encontramos ese contacto.");
  await writeLeads(admin, next);
  return { ok: true as const, id: leadId };
}

export function pilotInviteWhatsAppHref(lead: PilotInviteLead) {
  if (!lead.phone) return null;
  return gphInviteWhatsAppHref({
    tutorName: lead.tutor_name,
    playerName: lead.player_name ?? undefined,
    phoneE164: lead.phone.startsWith("52") ? lead.phone : `52${lead.phone}`,
    wave: lead.wave,
  });
}

export function pilotInviteEmailHref(lead: PilotInviteLead) {
  return gphInviteEmailMailto({
    tutorName: lead.tutor_name,
    playerName: lead.player_name ?? undefined,
    email: lead.email ?? undefined,
    wave: lead.wave,
  });
}
