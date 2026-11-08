/** Acuerdo comercial GPH × MiFicha. Vigente desde el 6 nov 2026. */
export const PARTNERSHIP_EFFECTIVE_ON = "2026-11-06";

/**
 * Mientras el piloto esté abierto, la membresía anual no se cobra.
 * Mantener alineado con TUTOR_PILOT_FREE en tutor-family.ts.
 */
export const MEMBERSHIP_CHECKOUT_DISABLED = true;

/**
 * Copy de precios para familias — una sola historia, sin mezclar
 * “cuesta / gratis / incluido en diagnóstico” en la misma frase.
 */
export const FAMILY_PRICING_COPY = {
  eyebrow: MEMBERSHIP_CHECKOUT_DISABLED
    ? "Familias · ficha sin costo hoy"
    : "Familias · membresía anual",
  /** Explicación completa (sección membresía, página). */
  today:
    "Hoy puedes armar la ficha del tutor sin pagar. Lo único que se cobra ahora es el diagnóstico GPH ($2,900): evaluación presencial + 12 meses de MiFicha.",
  /** Una línea (nav, pies, cards). */
  todayShort:
    "Ficha tutor sin costo. Diagnóstico GPH $2,900 (incluye 12 meses).",
  diagnosis:
    "$2,900 · diagnóstico GPH + 12 meses de MiFicha",
  /** Solo pie discreto; no va en el hero. */
  laterNote:
    "Más adelante la membresía sola será $1,200 al año. Si pagaste el diagnóstico, ese año ya viene incluido.",
} as const;

export const GPH_PARTNERSHIP = {
  gphOperator: "Gustavo Reyes",
  gphBrand: "GPH",
  platformOperator: "José Ricardo Briseño Amieva",
  platformBrand: "MiFicha",
  /** Lo que cobra MiFicha (Ricardo) por cada venta de estos SKUs. */
  mifichaShareMxn: 600,
} as const;

export type FamilySku = "diagnosis" | "membership";

export interface FamilyOrderRow {
  id: string;
  folio: string;
  sku: FamilySku;
  status: "pending" | "paid" | "failed" | "expired";
  amount_mxn: number;
  mificha_share_mxn: number;
  gph_share_mxn: number;
  payer_name: string;
  payer_email: string | null;
  payer_phone: string | null;
  player_name: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  paid_at: string | null;
  membership_until: string | null;
  notes: string | null;
  created_at: string;
}

export const FAMILY_PRODUCTS = {
  diagnosis: {
    sku: "diagnosis" as const,
    title: "Evaluación GPH + 1 año MiFicha",
    publicName: "Evaluación GPH",
    priceMxn: 2900,
    priceLabel: "$2,900",
    period: "MXN · sesión + 12 meses de plataforma",
    description:
      "Diagnóstico GPH de tu hijo (sesión, ficha y lectura de entrenador) e incluye 12 meses de acceso a MiFicha.",
    includesMembershipDays: 365,
    mifichaShareMxn: GPH_PARTNERSHIP.mifichaShareMxn,
    gphShareMxn: 2300,
  },
  membership: {
    sku: "membership" as const,
    title: "Membresía anual MiFicha",
    publicName: "Membresía anual",
    priceMxn: 1200,
    priceLabel: "$1,200",
    period: "MXN · 12 meses",
    description:
      "Seguimiento digital, avisos de visorías de Primera, convocatorias curadas, eventos con descuento y 1 ciclo de especialización al mes. Sin evaluación.",
    includesMembershipDays: 365,
    mifichaShareMxn: GPH_PARTNERSHIP.mifichaShareMxn,
    gphShareMxn: 600,
  },
} as const;

export function familyProduct(sku: string) {
  if (sku === "diagnosis" || sku === "membership") return FAMILY_PRODUCTS[sku];
  return null;
}

export function formatMxn(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}
