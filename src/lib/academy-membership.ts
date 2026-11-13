import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";

export { ACADEMY_MEMBERSHIP_FREE_PROMO } from "@/lib/membership-promo";
import { ACADEMY_MEMBERSHIP_FREE_PROMO } from "@/lib/membership-promo";

export const ACADEMY_PRODUCT = {
  id: "academia",
  title: "Membresía academia",
  priceUsd: 150,
  priceLabel: "$150",
  currency: "USD",
  period: "al año",
  days: 365,
  summary:
    "Plantel, partidos y avisos a tutores. El organizador activa la temporada.",
} as const;

/** ~$150 USD en MXN. Ajustable con ACADEMY_MEMBERSHIP_PRICE_MXN. */
export function academyMembershipPriceMxn() {
  const fromEnv = Number(process.env.ACADEMY_MEMBERSHIP_PRICE_MXN ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.round(fromEnv);
  return 2999;
}

const OPS_BUCKET = "mificha-ops";
const SUBS_STORE = "payments/academy-subscriptions.json";
const ORDERS_STORE = "payments/academy-orders.json";

export type AcademySubSource = "promo" | "paid" | "manual" | "exempt";

export type AcademySubRow = {
  academy_id: string;
  owner_user_id: string | null;
  email: string | null;
  until: string;
  created_at: string;
  source?: AcademySubSource;
};

export type AcademyOrderRow = {
  id: string;
  folio: string;
  status: "pending" | "paid" | "failed" | "expired";
  academy_id: string;
  owner_user_id: string;
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
  return `AC-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function addDaysIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isFutureDate(iso: string) {
  return iso.slice(0, 10) >= new Date().toISOString().slice(0, 10);
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

export async function readAcademySubs(admin: SupabaseClient) {
  return readJson<AcademySubRow>(admin, SUBS_STORE);
}

export async function findActiveAcademySub(admin: SupabaseClient, academyId: string) {
  const rows = await readAcademySubs(admin);
  return rows.find((row) => row.academy_id === academyId && isFutureDate(row.until)) ?? null;
}

/** ¿La academia puede operar el panel? Promo gratis, exempt, o sub activa. */
export async function academyMembershipIsActive(
  admin: SupabaseClient,
  academy: { id: string; billing_exempt?: boolean | null; plan_status?: string | null },
) {
  if (ACADEMY_MEMBERSHIP_FREE_PROMO) return true;
  if (academy.billing_exempt) return true;
  if (academy.plan_status && academy.plan_status !== "inactive") {
    const sub = await findActiveAcademySub(admin, academy.id);
    if (sub) return true;
    // Plan Stripe/legado aún marcado activo sin fila nueva.
    return true;
  }
  const sub = await findActiveAcademySub(admin, academy.id);
  return Boolean(sub);
}

export async function grantAcademyMembership(
  admin: SupabaseClient,
  input: {
    academyId: string;
    ownerUserId?: string | null;
    email?: string | null;
    days?: number;
    source?: AcademySubSource;
  },
) {
  const days = input.days ?? ACADEMY_PRODUCT.days;
  const until = addDaysIso(days);
  const now = new Date().toISOString();
  const rows = await readAcademySubs(admin);
  const index = rows.findIndex((row) => row.academy_id === input.academyId);
  const next: AcademySubRow = {
    academy_id: input.academyId,
    owner_user_id: input.ownerUserId ?? null,
    email: (input.email ?? "").trim().toLowerCase() || null,
    until: index >= 0 && rows[index].until > until ? rows[index].until : until,
    created_at: index >= 0 ? rows[index].created_at : now,
    source: input.source ?? "manual",
  };
  if (index >= 0) rows[index] = { ...rows[index], ...next };
  else rows.push(next);
  await writeJson(admin, SUBS_STORE, rows);

  // Marca plan activo en Postgres (enum legado: pro = academia de pago/anual).
  await admin
    .from("academies")
    .update({ plan_status: "pro" })
    .eq("id", input.academyId);

  return next;
}

export function academyMembershipPublicCopy() {
  const listPrice = `${ACADEMY_PRODUCT.priceLabel} ${ACADEMY_PRODUCT.currency}/${ACADEMY_PRODUCT.period.replace("al ", "")}`;
  if (ACADEMY_MEMBERSHIP_FREE_PROMO) {
    return {
      badge: "Gratis por tiempo limitado",
      priceLine: `Gratis ahora · después ${listPrice}`,
      meta: "Gratis · tiempo limitado",
      cta: "Registrar academia",
      short: "Gratis por tiempo limitado",
      headline: "Gratis para academias · tiempo limitado",
      summary:
        "Plantel, fichas y avisos a tutores — gratis por tiempo limitado. Después $150 USD/año.",
    };
  }
  return {
    badge: null as string | null,
    priceLine: listPrice,
    meta: listPrice,
    cta: `Contratar · ${ACADEMY_PRODUCT.priceLabel} USD/año`,
    short: listPrice,
    headline: "Membresía academia",
    summary:
      "Plantel, fichas y avisos a tutores · $150 USD/año. El organizador activa la temporada.",
  };
}

/** Texto de Planes que combina persona + academia según promos. */
export function planesHubSummary(
  personaPlanesSummary: string,
  academyCopy: ReturnType<typeof academyMembershipPublicCopy>,
) {
  // personaPlanesSummary ya menciona academia(gratis); reemplazar tramo academia.
  if (personaPlanesSummary.includes("academia")) {
    return personaPlanesSummary.replace(
      /academia \([^)]+\)/,
      ACADEMY_MEMBERSHIP_FREE_PROMO
        ? "academia (gratis por tiempo limitado; después $150 USD/año)"
        : "academia ($150 USD/año)",
    );
  }
  return `${personaPlanesSummary} Academia: ${academyCopy.short}.`;
}

export async function createAcademyCheckout(
  admin: SupabaseClient,
  input: {
    academyId: string;
    ownerUserId: string;
    email: string | null;
    payerName: string;
    academyName: string;
  },
) {
  if (!isMercadoPagoConfigured()) {
    throw new Error("Mercado Pago aún no está configurado.");
  }
  const amountMxn = academyMembershipPriceMxn();
  const now = new Date().toISOString();
  const order: AcademyOrderRow = {
    id: randomUUID(),
    folio: makeFolio(),
    status: "pending",
    academy_id: input.academyId,
    owner_user_id: input.ownerUserId,
    email: input.email,
    payer_name: input.payerName,
    amount_mxn: amountMxn,
    amount_usd: ACADEMY_PRODUCT.priceUsd,
    mp_preference_id: null,
    mp_payment_id: null,
    paid_at: null,
    membership_until: null,
    created_at: now,
  };

  const preference = await createMercadoPagoPreference({
    title: `${ACADEMY_PRODUCT.title} · ${input.academyName}`,
    priceMxn: amountMxn,
    folio: order.folio,
    sku: "academia",
    payerName: input.payerName,
    payerEmail: input.email ?? "",
  });

  order.mp_preference_id = preference.preferenceId;
  const rows = await readJson<AcademyOrderRow>(admin, ORDERS_STORE);
  rows.push(order);
  await writeJson(admin, ORDERS_STORE, rows);

  return { order, checkoutUrl: preference.checkoutUrl };
}

export async function getAcademyOrderByFolio(admin: SupabaseClient, folio: string) {
  const rows = await readJson<AcademyOrderRow>(admin, ORDERS_STORE);
  return rows.find((row) => row.folio === folio) ?? null;
}

export async function markAcademyOrderPaid(
  admin: SupabaseClient,
  folio: string,
  paymentId: string,
) {
  const rows = await readJson<AcademyOrderRow>(admin, ORDERS_STORE);
  const index = rows.findIndex((row) => row.folio === folio);
  if (index < 0) return null;
  const current = rows[index];
  if (current.status === "paid") return current;

  const sub = await grantAcademyMembership(admin, {
    academyId: current.academy_id,
    ownerUserId: current.owner_user_id,
    email: current.email,
    days: ACADEMY_PRODUCT.days,
    source: "paid",
  });

  const updated: AcademyOrderRow = {
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

/** Cobro activo (promo apagada). */
export function isAcademyAnnualBillingEnabled() {
  return !ACADEMY_MEMBERSHIP_FREE_PROMO;
}
