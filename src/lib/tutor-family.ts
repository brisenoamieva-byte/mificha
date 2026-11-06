import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listFamilyOrders, type FamilyOrderRow } from "@/lib/family-orders";

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";
const MATERIALS = "families/materials.json";

export type TutorMaterialKind = "photo" | "video" | "story";

export interface TutorChild {
  id: string;
  guardian_user_id: string;
  guardian_email: string;
  guardian_phone: string | null;
  player_name: string;
  membership_until: string | null;
  source_folios: string[];
  created_at: string;
}

export interface TutorMaterial {
  id: string;
  child_id: string;
  guardian_user_id: string;
  kind: TutorMaterialKind;
  title: string;
  body: string | null;
  storage_path: string | null;
  created_at: string;
}

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

export function membershipIsActive(until: string | null | undefined) {
  if (!until) return false;
  return until.slice(0, 10) >= todayIso();
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readJson<T>(admin: SupabaseClient, path: string): Promise<T[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(path);
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
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(path, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

function orderMatchesGuardian(order: FamilyOrderRow, email: string, phone: string) {
  if (order.status !== "paid") return false;
  if (!membershipIsActive(order.membership_until)) return false;
  const orderEmail = (order.payer_email ?? "").trim().toLowerCase();
  const orderPhone = phoneKey(order.payer_phone);
  if (email && orderEmail && orderEmail === email) return true;
  if (phone && orderPhone && orderPhone === phone) return true;
  return false;
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
  const roster = await readJson<TutorChild>(admin, ROSTER);

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
      }
      if (
        order.membership_until &&
        (!existing.membership_until || order.membership_until > existing.membership_until)
      ) {
        existing.membership_until = order.membership_until;
      }
      existing.guardian_email = email || existing.guardian_email;
      existing.guardian_phone = phone || existing.guardian_phone;
      continue;
    }
    roster.unshift({
      id: randomUUID(),
      guardian_user_id: user.id,
      guardian_email: email,
      guardian_phone: phone || null,
      player_name: playerName,
      membership_until: order.membership_until,
      source_folios: [order.folio],
      created_at: new Date().toISOString(),
    });
  }

  await writeJson(admin, ROSTER, roster);
  return roster
    .filter((child) => child.guardian_user_id === user.id)
    .sort((a, b) => a.player_name.localeCompare(b.player_name, "es"));
}

export async function listTutorMaterials(admin: SupabaseClient, child: TutorChild) {
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const mine = rows
    .filter(
      (row) => row.child_id === child.id && row.guardian_user_id === child.guardian_user_id,
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

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
  const roster = await readJson<TutorChild>(admin, ROSTER);
  return (
    roster.find((child) => child.id === childId && child.guardian_user_id === userId) ??
    null
  );
}

export async function addTutorStory(
  admin: SupabaseClient,
  child: TutorChild,
  title: string,
  body: string,
) {
  if (!membershipIsActive(child.membership_until)) {
    throw new Error("La membresía no está vigente. Paga el año para subir material.");
  }
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

export async function prepareTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  kind: "photo" | "video",
  fileName: string,
) {
  if (!membershipIsActive(child.membership_until)) {
    throw new Error("La membresía no está vigente. Paga el año para subir material.");
  }
  await ensureOpsBucket(admin);
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "archivo";
  const storagePath = `families/${child.id}/${randomUUID()}-${safe}`;
  const signed = await admin.storage.from(OPS_BUCKET).createSignedUploadUrl(storagePath);
  if (signed.error || !signed.data) {
    throw new Error(signed.error?.message || "No se pudo preparar la carga.");
  }
  return {
    path: storagePath,
    token: signed.data.token,
  };
}

export async function commitTutorUpload(
  admin: SupabaseClient,
  child: TutorChild,
  input: { kind: "photo" | "video"; title: string; path: string },
) {
  if (!membershipIsActive(child.membership_until)) {
    throw new Error("La membresía no está vigente.");
  }
  if (!input.path.startsWith(`families/${child.id}/`)) {
    throw new Error("Archivo inválido.");
  }
  const rows = await readJson<TutorMaterial>(admin, MATERIALS);
  const row: TutorMaterial = {
    id: randomUUID(),
    child_id: child.id,
    guardian_user_id: child.guardian_user_id,
    kind: input.kind,
    title: input.title.trim() || (input.kind === "photo" ? "Foto" : "Video"),
    body: null,
    storage_path: input.path,
    created_at: new Date().toISOString(),
  };
  rows.unshift(row);
  await writeJson(admin, MATERIALS, rows);
  return row;
}
