import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { SCOUT_PRODUCT } from "@/lib/scout-product";

export { PERSONA_MEMBERSHIP_FREE_PROMO } from "@/lib/membership-promo";
import { PERSONA_MEMBERSHIP_FREE_PROMO } from "@/lib/membership-promo";

/** ~$50 USD en MXN (Mercado Pago cobra en MXN). Ajustable por env. */
export function personaMembershipPriceMxn() {
  const fromEnv = Number(process.env.PERSONA_MEMBERSHIP_PRICE_MXN ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.round(fromEnv);
  return 999;
}

export const PERSONA_MEMBERSHIP_DAYS = 365;

const OPS_BUCKET = "mificha-ops";
const SUBS_STORE = "payments/scout-subscriptions.json";
const ORDERS_STORE = "payments/persona-orders.json";

export type PersonaSubSource = "promo" | "paid" | "manual" | "env";

export type PersonaSubRow = {
  user_id: string;
  email: string | null;
  until: string;
  created_at: string;
  source?: PersonaSubSource;
};

export type PersonaOrderRow = {
  id: string;
  folio: string;
  status: "pending" | "paid" | "failed" | "expired";
  user_id: string;
  email: string | null;
  payer_name: string;
  amount_mxn: number;
  amount_usd: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  paid_at: string | null;
  membership_until: string | null;
  created_at: string;
};

function makeFolio() {
  return `PE-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function addDaysIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isFutureIso(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > Date.now();
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

async function writeJson<T>(admin: SupabaseClient, path: string, rows: T[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(path, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

export async function readPersonaSubs(admin: SupabaseClient) {
  return readJson<PersonaSubRow>(admin, SUBS_STORE);
}

export async function findActivePersonaSub(admin: SupabaseClient, userId: string) {
  const rows = await readPersonaSubs(admin);
  return rows.find((row) => row.user_id === userId && isFutureIso(row.until)) ?? null;
}

/** Extiende o crea membresía persona (Explorar Pro). */
export async function grantPersonaMembership(
  admin: SupabaseClient,
  input: {
    userId: string;
    email?: string | null;
    days?: number;
    source?: PersonaSubSource;
  },
) {
  const days = input.days ?? PERSONA_MEMBERSHIP_DAYS;
  const until = addDaysIso(days);
  const now = new Date().toISOString();
  const rows = await readPersonaSubs(admin);
  const index = rows.findIndex((row) => row.user_id === input.userId);
  const next: PersonaSubRow = {
    user_id: input.userId,
    email: (input.email ?? "").trim().toLowerCase() || null,
    until:
      index >= 0 && rows[index].until > until ? rows[index].until : until,
    created_at: index >= 0 ? rows[index].created_at : now,
    source: input.source ?? "manual",
  };
  if (index >= 0) rows[index] = { ...rows[index], ...next };
  else rows.push(next);
  await writeJson(admin, SUBS_STORE, rows);
  return next;
}

export function personaMembershipPublicCopy() {
  const listPrice = `${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency}/${SCOUT_PRODUCT.period.replace("al ", "")}`;
  if (PERSONA_MEMBERSHIP_FREE_PROMO) {
    return {
      badge: "Gratis por tiempo limitado",
      priceLine: `Gratis ahora · después ${listPrice}`,
      meta: "Gratis · tiempo limitado",
      cta: "Activar gratis",
      short: "Gratis por tiempo limitado",
      planesSummary:
        "Dos cuentas: persona (gratis por tiempo limitado; después $50 USD/año) o academia (gratis por tiempo limitado; después $150 USD/año).",
    };
  }
  return {
    badge: null as string | null,
    priceLine: listPrice,
    meta: listPrice,
    cta: `Contratar · ${SCOUT_PRODUCT.priceLabel} USD/año`,
    short: listPrice,
    planesSummary:
      "Dos cuentas: persona ($50 USD/año) o academia ($150 USD/año).",
  };
}

export async function createPersonaCheckout(
  admin: SupabaseClient,
  input: {
    userId: string;
    email: string | null;
    payerName: string;
  },
) {
  if (!isMercadoPagoConfigured()) {
    throw new Error("Mercado Pago aún no está configurado.");
  }
  const amountMxn = personaMembershipPriceMxn();
  const now = new Date().toISOString();
  const order: PersonaOrderRow = {
    id: randomUUID(),
    folio: makeFolio(),
    status: "pending",
    user_id: input.userId,
    email: input.email,
    payer_name: input.payerName,
    amount_mxn: amountMxn,
    amount_usd: SCOUT_PRODUCT.priceUsd,
    mp_preference_id: null,
    mp_payment_id: null,
    paid_at: null,
    membership_until: null,
    created_at: now,
  };

  const preference = await createMercadoPagoPreference({
    title: `${SCOUT_PRODUCT.title} · Explorar Pro`,
    priceMxn: amountMxn,
    folio: order.folio,
    sku: "persona",
    payerName: input.payerName,
    payerEmail: input.email ?? "",
  });

  order.mp_preference_id = preference.preferenceId;
  const rows = await readJson<PersonaOrderRow>(admin, ORDERS_STORE);
  rows.push(order);
  await writeJson(admin, ORDERS_STORE, rows);

  return { order, checkoutUrl: preference.checkoutUrl };
}

export async function getPersonaOrderByFolio(admin: SupabaseClient, folio: string) {
  const rows = await readJson<PersonaOrderRow>(admin, ORDERS_STORE);
  return rows.find((row) => row.folio === folio) ?? null;
}

export async function markPersonaOrderPaid(
  admin: SupabaseClient,
  folio: string,
  paymentId: string,
) {
  const rows = await readJson<PersonaOrderRow>(admin, ORDERS_STORE);
  const index = rows.findIndex((row) => row.folio === folio);
  if (index < 0) return null;
  const current = rows[index];
  if (current.status === "paid") return current;

  const sub = await grantPersonaMembership(admin, {
    userId: current.user_id,
    email: current.email,
    days: PERSONA_MEMBERSHIP_DAYS,
    source: "paid",
  });

  const updated: PersonaOrderRow = {
    ...current,
    status: "paid",
    mp_payment_id: paymentId,
    paid_at: new Date().toISOString(),
    membership_until: sub.until,
  };
  rows[index] = updated;
  await writeJson(admin, ORDERS_STORE, rows);
  return updated;
}
