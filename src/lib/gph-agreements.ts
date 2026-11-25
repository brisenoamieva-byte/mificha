import { createHash, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeGphPackage,
  GPH_ACADEMY_SLUG,
  GPH_REGLAMENTO_ISSUED_AT,
  GPH_REGLAMENTO_TITLE,
  GPH_REGLAMENTO_VERSION,
  type GphLevelId,
  type GphPaymentMode,
  type GphPositionId,
  type GphScheduleId,
  type GphSedeId,
} from "@/lib/gph-reglamento-content";
import { listTutorLinksByAcademy } from "@/lib/tutor-family";
import { canViewPartnershipLedger } from "@/lib/partnership-access";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";

const OPS_BUCKET = "mificha-ops";
const AGREEMENTS_PATH = "academies/gph-agreements.json";

export type GphAgreementStatus =
  | "draft"
  | "sent"
  | "signed_tutor"
  | "active"
  | "cancelled";

export interface GphAgreementFields {
  player_name: string;
  birth_date: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  sede: GphSedeId;
  group_level: string;
  schedule: GphScheduleId;
  position: GphPositionId;
  level_id: GphLevelId;
  payment_mode: GphPaymentMode;
  months: number;
  inscription_exempt: boolean;
  inscription_exempt_reason: string;
  amount_agreed_mxn: number;
  program_start: string;
  program_end: string;
  payment_note: string;
}

export interface GphAgreementEvidence {
  accepted_at: string;
  acceptor_user_id: string;
  acceptor_name: string;
  acceptor_email: string | null;
  ip: string | null;
  user_agent: string | null;
  template_version: string;
  template_hash: string;
  fields_hash: string;
}

export interface GphAgreementCountersign {
  at: string;
  user_id: string;
  name: string;
  email: string | null;
}

export interface GphAgreement {
  id: string;
  status: GphAgreementStatus;
  academy_id: string;
  academy_name: string;
  player_id: string | null;
  tutor_child_id: string | null;
  guardian_user_id: string | null;
  template_version: string;
  template_title: string;
  template_issued_at: string;
  fields: GphAgreementFields;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  tutor_evidence: GphAgreementEvidence | null;
  gph_countersign: GphAgreementCountersign | null;
  sealed_pdf_path: string | null;
  cancelled_at: string | null;
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function agreementsFingerprint(rows: GphAgreement[]) {
  return rows
    .map((row) => `${row.id}:${row.status}:${row.updated_at}`)
    .sort()
    .join("|");
}

function snapshotStamp(rows: GphAgreement[]) {
  return rows.reduce((max, row) => (row.updated_at > max ? row.updated_at : max), "");
}

async function parseAgreementsBlob(data: Blob | null): Promise<GphAgreement[] | null> {
  if (!data) return null;
  try {
    const parsed = JSON.parse(await data.text()) as GphAgreement[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readAgreements(admin: SupabaseClient): Promise<GphAgreement[]> {
  // Prefer newest versioned snapshot (list is not CDN-sticky like a single object URL).
  const { data: listed } = await admin.storage.from(OPS_BUCKET).list("academies/gph-agreements", {
    limit: 40,
  });
  const latest = (listed ?? [])
    .filter((f) => typeof f.name === "string" && f.name.startsWith("v-") && f.name.endsWith(".json"))
    .sort((a, b) => b.name.localeCompare(a.name))[0];

  let versioned: GphAgreement[] | null = null;
  if (latest) {
    const { data } = await admin.storage
      .from(OPS_BUCKET)
      .download(`academies/gph-agreements/${latest.name}`);
    versioned = await parseAgreementsBlob(data);
  }

  const { data: legacyData } = await admin.storage.from(OPS_BUCKET).download(AGREEMENTS_PATH);
  const legacy = await parseAgreementsBlob(legacyData);

  if (versioned && legacy) {
    return snapshotStamp(versioned) >= snapshotStamp(legacy) ? versioned : legacy;
  }
  return versioned ?? legacy ?? [];
}

async function writeAgreements(admin: SupabaseClient, rows: GphAgreement[]) {
  await ensureOpsBucket(admin);
  const payload = rows.slice(0, 2000);
  const expected = agreementsFingerprint(payload);
  const body = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const versionPath = `academies/gph-agreements/v-${Date.now()}-${randomUUID().slice(0, 8)}.json`;

  const { error: versionError } = await admin.storage.from(OPS_BUCKET).upload(versionPath, body, {
    upsert: false,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (versionError) throw new Error(versionError.message);

  // Keep legacy path in sync for backups / older tooling.
  const { error } = await admin.storage.from(OPS_BUCKET).upload(AGREEMENTS_PATH, body, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);

  for (let i = 0; i < 12; i++) {
    const confirmed = await readAgreements(admin);
    if (agreementsFingerprint(confirmed) === expected) return;
    await sleep(120 + i * 80);
  }
  throw new Error("No se pudo confirmar el guardado de cartas GPH.");
}

export function hashGphTemplateVersion() {
  return createHash("sha256")
    .update(`${GPH_REGLAMENTO_VERSION}|${GPH_REGLAMENTO_TITLE}|${GPH_REGLAMENTO_ISSUED_AT}`)
    .digest("hex");
}

export function hashGphFields(fields: GphAgreementFields) {
  return createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}

export async function resolveGphAcademy(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("academies")
    .select("id, name, slug, owner_id")
    .eq("slug", GPH_ACADEMY_SLUG)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No encontramos Academia Real GPH.");
  return data;
}

export async function assertCanManageGphAgreements(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  academyId: string,
) {
  const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
  const isPartner = canViewPartnershipLedger(user);
  if (isGph || isPartner) {
    const academy = await resolveGphAcademy(admin);
    if (academy.id !== academyId) {
      throw new Error("Este módulo solo aplica a Academia Real GPH.");
    }
    return academy;
  }
  const access = await requireAcademyAccess(admin, user.id, academyId);
  if (access.slug !== GPH_ACADEMY_SLUG) {
    throw new Error("Este módulo solo aplica a Academia Real GPH.");
  }
  return access;
}

function normalizeFields(raw: Partial<GphAgreementFields>): GphAgreementFields {
  const levelId = String(raw.level_id ?? "desarrollo") as GphLevelId;
  const paymentMode = (raw.payment_mode === "prepaid" ? "prepaid" : "monthly") as GphPaymentMode;
  const months = Number(raw.months ?? 1);
  const inscriptionExempt = Boolean(raw.inscription_exempt);
  const pkg = computeGphPackage({
    levelId,
    paymentMode,
    months,
    inscriptionExempt,
  });
  const amount =
    Number(raw.amount_agreed_mxn) > 0 ? Number(raw.amount_agreed_mxn) : pkg.totalMxn;

  return {
    player_name: String(raw.player_name ?? "").trim(),
    birth_date: String(raw.birth_date ?? "").trim().slice(0, 10),
    guardian_name: String(raw.guardian_name ?? "").trim(),
    guardian_phone: String(raw.guardian_phone ?? "").trim(),
    guardian_email: String(raw.guardian_email ?? "").trim().toLowerCase(),
    sede: (raw.sede === "san_javier" ? "san_javier" : "casa_juventud") as GphSedeId,
    group_level: String(raw.group_level ?? "").trim(),
    schedule: (raw.schedule === "mar_jue" ? "mar_jue" : "lun_mie") as GphScheduleId,
    position: (raw.position === "portero" ? "portero" : "campo") as GphPositionId,
    level_id: pkg.level.id,
    payment_mode: paymentMode,
    months: pkg.months,
    inscription_exempt: inscriptionExempt,
    inscription_exempt_reason: String(raw.inscription_exempt_reason ?? "").trim(),
    amount_agreed_mxn: amount,
    program_start: String(raw.program_start ?? "").trim().slice(0, 10),
    program_end: String(raw.program_end ?? "").trim().slice(0, 10),
    payment_note: String(raw.payment_note ?? "").trim(),
  };
}

function assertDraftFields(fields: GphAgreementFields) {
  if (!fields.player_name) throw new Error("Falta el nombre del jugador.");
  if (!fields.guardian_name) throw new Error("Falta el nombre del tutor.");
  if (!fields.program_start || !fields.program_end) {
    throw new Error("Indica inicio y fin del programa.");
  }
  if (fields.amount_agreed_mxn <= 0) throw new Error("Indica el monto pactado.");
}

export async function listGphAgreementsForAcademy(
  admin: SupabaseClient,
  academyId: string,
) {
  const rows = await readAgreements(admin);
  return rows
    .filter((row) => row.academy_id === academyId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function listGphAgreementsForTutor(
  admin: SupabaseClient,
  guardianUserId: string,
) {
  const rows = await readAgreements(admin);
  return rows
    .filter(
      (row) =>
        row.guardian_user_id === guardianUserId &&
        (row.status === "sent" ||
          row.status === "signed_tutor" ||
          row.status === "active"),
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getGphAgreement(admin: SupabaseClient, id: string) {
  const rows = await readAgreements(admin);
  return rows.find((row) => row.id === id) ?? null;
}

export async function createGphAgreementDraft(
  admin: SupabaseClient,
  input: {
    academyId: string;
    createdBy: string;
    playerId?: string | null;
    tutorChildId?: string | null;
    guardianUserId?: string | null;
    fields: Partial<GphAgreementFields>;
  },
) {
  const academy = await resolveGphAcademy(admin);
  if (academy.id !== input.academyId) {
    throw new Error("Este módulo solo aplica a Academia Real GPH.");
  }

  let fields = normalizeFields(input.fields);
  let tutorChildId = input.tutorChildId?.trim() || null;
  let guardianUserId = input.guardianUserId?.trim() || null;
  let playerId = input.playerId?.trim() || null;

  if (playerId) {
    const { data: player } = await admin
      .from("players")
      .select("id, first_name, last_name, birth_date, guardian_name, guardian_phone, guardian_email")
      .eq("id", playerId)
      .eq("academy_id", academy.id)
      .maybeSingle();
    if (!player) throw new Error("Jugador no encontrado en el plantel GPH.");
    if (!fields.player_name) {
      fields.player_name = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();
    }
    if (!fields.birth_date && player.birth_date) {
      fields.birth_date = String(player.birth_date).slice(0, 10);
    }
    if (!fields.guardian_name && player.guardian_name) {
      fields.guardian_name = player.guardian_name;
    }
    if (!fields.guardian_phone && player.guardian_phone) {
      fields.guardian_phone = player.guardian_phone;
    }
    if (!fields.guardian_email && player.guardian_email) {
      fields.guardian_email = player.guardian_email.toLowerCase();
    }

    const links = await listTutorLinksByAcademy(admin, academy.id);
    const link = links.find((row) => row.player_id === playerId);
    if (link) {
      tutorChildId = tutorChildId || link.tutor_child_id;
      if (!fields.guardian_email && link.guardian_email) {
        fields.guardian_email = link.guardian_email.toLowerCase();
      }
      if (!fields.player_name) fields.player_name = link.player_name;
    }
  }

  if (tutorChildId && !guardianUserId) {
    const { listAllTutorChildrenForOps } = await import("@/lib/tutor-family");
    const roster = await listAllTutorChildrenForOps(admin);
    const child = roster.find((row) => row.id === tutorChildId);
    if (child?.guardian_user_id && !String(child.guardian_user_id).startsWith("pending:")) {
      guardianUserId = child.guardian_user_id;
    }
    if (child) {
      if (!fields.guardian_email) fields.guardian_email = child.guardian_email;
      if (!fields.guardian_phone) {
        fields.guardian_phone = child.guardian_phone || fields.guardian_phone;
      }
    }
  }

  // Si solo hay email, intenta mapear a perfil existente.
  if (!guardianUserId && fields.guardian_email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", fields.guardian_email)
      .maybeSingle();
    if (profile?.id) guardianUserId = String(profile.id);
  }

  fields = normalizeFields(fields);
  assertDraftFields(fields);

  const now = new Date().toISOString();
  const row: GphAgreement = {
    id: randomUUID(),
    status: "draft",
    academy_id: academy.id,
    academy_name: academy.name,
    player_id: playerId,
    tutor_child_id: tutorChildId,
    guardian_user_id: guardianUserId,
    template_version: GPH_REGLAMENTO_VERSION,
    template_title: GPH_REGLAMENTO_TITLE,
    template_issued_at: GPH_REGLAMENTO_ISSUED_AT,
    fields,
    created_by: input.createdBy,
    created_at: now,
    updated_at: now,
    sent_at: null,
    tutor_evidence: null,
    gph_countersign: null,
    sealed_pdf_path: null,
    cancelled_at: null,
  };

  const rows = await readAgreements(admin);
  rows.unshift(row);
  await writeAgreements(admin, rows);
  return row;
}

export async function updateGphAgreementDraft(
  admin: SupabaseClient,
  input: {
    agreementId: string;
    fields?: Partial<GphAgreementFields>;
    guardianUserId?: string | null;
    tutorChildId?: string | null;
    playerId?: string | null;
  },
) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === input.agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  const prev = rows[index];
  if (prev.status !== "draft" && prev.status !== "sent") {
    throw new Error("Solo se puede editar un borrador o una carta enviada pendiente.");
  }
  const fields = normalizeFields({ ...prev.fields, ...(input.fields ?? {}) });
  assertDraftFields(fields);
  const now = new Date().toISOString();
  rows[index] = {
    ...prev,
    fields,
    player_id:
      input.playerId !== undefined ? input.playerId?.trim() || null : prev.player_id,
    tutor_child_id:
      input.tutorChildId !== undefined
        ? input.tutorChildId?.trim() || null
        : prev.tutor_child_id,
    guardian_user_id:
      input.guardianUserId !== undefined
        ? input.guardianUserId?.trim() || null
        : prev.guardian_user_id,
    updated_at: now,
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function sendGphAgreement(admin: SupabaseClient, agreementId: string) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  const prev = rows[index];
  if (prev.status !== "draft" && prev.status !== "sent") {
    throw new Error("Esa carta ya no se puede enviar.");
  }
  assertDraftFields(prev.fields);
  if (!prev.guardian_user_id && !prev.fields.guardian_email) {
    throw new Error("Asigna un tutor con cuenta o un correo para enviar la carta.");
  }
  const now = new Date().toISOString();
  rows[index] = {
    ...prev,
    status: "sent",
    sent_at: prev.sent_at || now,
    updated_at: now,
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function acceptGphAgreementAsTutor(
  admin: SupabaseClient,
  input: {
    agreementId: string;
    guardianUserId: string;
    acceptorName: string;
    acceptorEmail?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  },
) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === input.agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  const prev = rows[index];
  if (prev.status !== "sent") {
    throw new Error("Esta carta no está pendiente de tu firma.");
  }
  if (prev.guardian_user_id && prev.guardian_user_id !== input.guardianUserId) {
    throw new Error("No autorizado.");
  }
  if (!prev.guardian_user_id) {
    // Primera aceptación: reclamar por email o asignar al usuario actual.
    prev.guardian_user_id = input.guardianUserId;
  }

  const now = new Date().toISOString();
  const evidence: GphAgreementEvidence = {
    accepted_at: now,
    acceptor_user_id: input.guardianUserId,
    acceptor_name: input.acceptorName.trim() || "Tutor",
    acceptor_email: input.acceptorEmail?.trim().toLowerCase() || null,
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
    template_version: prev.template_version,
    template_hash: hashGphTemplateVersion(),
    fields_hash: hashGphFields(prev.fields),
  };

  rows[index] = {
    ...prev,
    status: "signed_tutor",
    guardian_user_id: input.guardianUserId,
    tutor_evidence: evidence,
    updated_at: now,
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function countersignGphAgreement(
  admin: SupabaseClient,
  input: {
    agreementId: string;
    userId: string;
    name: string;
    email?: string | null;
    sealedPdfPath?: string | null;
  },
) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === input.agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  const prev = rows[index];
  if (prev.status !== "signed_tutor" && prev.status !== "active") {
    throw new Error("El tutor debe firmar antes de la contrafirma GPH.");
  }
  const now = new Date().toISOString();
  rows[index] = {
    ...prev,
    status: "active",
    gph_countersign: {
      at: now,
      user_id: input.userId,
      name: input.name.trim() || "GPH",
      email: input.email?.trim().toLowerCase() || null,
    },
    sealed_pdf_path: input.sealedPdfPath ?? prev.sealed_pdf_path,
    updated_at: now,
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function setGphAgreementSealedPdf(
  admin: SupabaseClient,
  agreementId: string,
  sealedPdfPath: string,
) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  rows[index] = {
    ...rows[index],
    sealed_pdf_path: sealedPdfPath,
    updated_at: new Date().toISOString(),
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function cancelGphAgreement(admin: SupabaseClient, agreementId: string) {
  const rows = await readAgreements(admin);
  const index = rows.findIndex((row) => row.id === agreementId);
  if (index < 0) throw new Error("No encontramos esa carta.");
  const prev = rows[index];
  if (prev.status === "active") {
    throw new Error("Una carta activa no se cancela aquí; genera una nueva versión.");
  }
  const now = new Date().toISOString();
  rows[index] = {
    ...prev,
    status: "cancelled",
    cancelled_at: now,
    updated_at: now,
  };
  await writeAgreements(admin, rows);
  return rows[index];
}

export async function uploadSealedAgreementPdf(
  admin: SupabaseClient,
  agreementId: string,
  bytes: Uint8Array,
) {
  await ensureOpsBucket(admin);
  const path = `academies/gph-agreements/${agreementId}.pdf`;
  const { error } = await admin.storage.from(OPS_BUCKET).upload(path, bytes, {
    upsert: true,
    contentType: "application/pdf",
    cacheControl: "0",
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function downloadSealedAgreementPdf(
  admin: SupabaseClient,
  path: string,
) {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message || "PDF no encontrado.");
  return Buffer.from(await data.arrayBuffer());
}

/** Tras fusionar fichas tutor: reapunta cartas al child canónico. */
export async function remappointGphAgreementsTutorChild(
  admin: SupabaseClient,
  fromChildId: string,
  toChildId: string,
) {
  if (!fromChildId || !toChildId || fromChildId === toChildId) return 0;
  const rows = await readAgreements(admin);
  let changed = 0;
  const next = rows.map((row) => {
    if (row.tutor_child_id !== fromChildId) return row;
    changed += 1;
    return {
      ...row,
      tutor_child_id: toChildId,
      updated_at: new Date().toISOString(),
    };
  });
  if (changed > 0) await writeAgreements(admin, next);
  return changed;
}
