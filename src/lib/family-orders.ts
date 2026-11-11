import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fireAndForgetOpsNotify } from "@/lib/email/ops-notify";
import {
  familyProduct,
  formatMxn,
  type FamilyOrderRow,
  type FamilySku,
} from "@/lib/gph-commerce";
import { canViewPartnershipLedger } from "@/lib/partnership-access";

export type { FamilyOrderRow, FamilySku };

const OPS_BUCKET = "mificha-ops";
const STORE = "payments/family-orders.json";

function isMissingTable(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return (
    message.includes("family_orders") ||
    message.includes("schema cache") ||
    error?.code === "PGRST205"
  );
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readStorageOrders(admin: SupabaseClient): Promise<FamilyOrderRow[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(STORE);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as FamilyOrderRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStorageOrders(admin: SupabaseClient, rows: FamilyOrderRow[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(STORE, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

function makeFolio() {
  return `MF-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function parseCheckoutInput(raw: {
  sku?: string;
  payer_name?: string;
  payer_email?: string;
  payer_phone?: string;
  player_name?: string;
}) {
  const product = familyProduct(String(raw.sku ?? ""));
  if (!product) return { error: "Elige evaluación o membresía." };
  const name = String(raw.payer_name ?? "").replace(/\s+/g, " ").trim();
  if (name.length < 5) return { error: "Escribe el nombre de quien paga." };
  const email = String(raw.payer_email ?? "").trim().toLowerCase();
  const phone = String(raw.payer_phone ?? "").replace(/\D/g, "");
  if (!email && phone.length < 10) {
    return { error: "Pon un WhatsApp a 10 dígitos o un correo." };
  }
  return {
    data: {
      sku: product.sku,
      payer_name: name,
      payer_email: email || null,
      payer_phone: phone.length >= 10 ? phone : null,
      player_name: String(raw.player_name ?? "").replace(/\s+/g, " ").trim() || null,
    },
  };
}

export async function createFamilyOrder(
  admin: SupabaseClient,
  raw: {
    sku: FamilySku;
    payer_name: string;
    payer_email: string | null;
    payer_phone: string | null;
    player_name: string | null;
  },
) {
  const product = familyProduct(raw.sku);
  if (!product) throw new Error("SKU inválido.");
  const now = new Date().toISOString();
  const row: Omit<FamilyOrderRow, "id"> & { id?: string } = {
    folio: makeFolio(),
    sku: product.sku,
    status: "pending",
    amount_mxn: product.priceMxn,
    mificha_share_mxn: product.mifichaShareMxn,
    gph_share_mxn: product.gphShareMxn,
    payer_name: raw.payer_name,
    payer_email: raw.payer_email,
    payer_phone: raw.payer_phone,
    player_name: raw.player_name,
    mp_preference_id: null,
    mp_payment_id: null,
    paid_at: null,
    membership_until: null,
    notes: null,
    created_at: now,
  };

  const { data, error } = await admin.from("family_orders").insert(row).select("*").single();
  if (!error && data) return data as FamilyOrderRow;
  if (error && !isMissingTable(error)) throw new Error(error.message);

  const stored: FamilyOrderRow = { id: randomUUID(), ...row };
  const rows = await readStorageOrders(admin);
  rows.unshift(stored);
  await writeStorageOrders(admin, rows);
  return stored;
}

export async function patchFamilyOrder(
  admin: SupabaseClient,
  folio: string,
  patch: Partial<FamilyOrderRow>,
) {
  const { data, error } = await admin
    .from("family_orders")
    .update(patch)
    .eq("folio", folio)
    .select("*")
    .maybeSingle();
  if (!error && data) return data as FamilyOrderRow;
  if (error && !isMissingTable(error)) throw new Error(error.message);

  const rows = await readStorageOrders(admin);
  const index = rows.findIndex((row) => row.folio === folio);
  if (index < 0) return null;
  rows[index] = { ...rows[index], ...patch };
  await writeStorageOrders(admin, rows);
  return rows[index];
}

export async function getFamilyOrderByFolio(admin: SupabaseClient, folio: string) {
  const { data, error } = await admin
    .from("family_orders")
    .select("*")
    .eq("folio", folio)
    .maybeSingle();
  if (!error) return (data as FamilyOrderRow | null) ?? null;
  if (!isMissingTable(error)) throw new Error(error.message);
  const rows = await readStorageOrders(admin);
  return rows.find((row) => row.folio === folio) ?? null;
}

export async function markFamilyOrderPaid(
  admin: SupabaseClient,
  folio: string,
  paymentId: string,
) {
  const current = await getFamilyOrderByFolio(admin, folio);
  if (!current) return null;
  if (current.status === "paid") return current;

  const product = familyProduct(current.sku);
  const until = product ? addDaysIso(product.includesMembershipDays) : addDaysIso(365);
  const updated = await patchFamilyOrder(admin, folio, {
    status: "paid",
    mp_payment_id: paymentId,
    paid_at: new Date().toISOString(),
    membership_until: until,
  });

  if (updated?.sku === "diagnosis") {
    fireAndForgetOpsNotify({
      kind: "diagnosis_paid",
      subject: `Pago evaluación GPH · ${updated.folio}`,
      lines: [
        ["Folio", updated.folio],
        ["Pagó", updated.payer_name],
        ["Correo", updated.payer_email],
        ["WhatsApp", updated.payer_phone],
        ["Jugador", updated.player_name],
        ["Monto", formatMxn(updated.amount_mxn)],
        ["MP payment", updated.mp_payment_id],
        ["Membresía hasta", updated.membership_until],
      ],
    });
  }

  return updated;
}

export async function listFamilyOrders(admin: SupabaseClient) {
  const { data, error } = await admin
    .from("family_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(400);
  if (!error) return (data ?? []) as FamilyOrderRow[];
  if (!isMissingTable(error)) throw new Error(error.message);
  const rows = await readStorageOrders(admin);
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function canManageFamilyOrders(
  _admin: SupabaseClient,
  user: { id: string; email?: string | null },
) {
  return canViewPartnershipLedger(user);
}
