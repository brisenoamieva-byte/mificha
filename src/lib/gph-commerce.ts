/** Acuerdo comercial GPH × MiFicha. Vigente desde el 6 nov 2026. */
export const PARTNERSHIP_EFFECTIVE_ON = "2026-11-06";

/**
 * Mientras el piloto esté abierto, la membresía anual no se cobra.
 * Mantener alineado con TUTOR_PILOT_FREE en tutor-family.ts.
 */
export const MEMBERSHIP_CHECKOUT_DISABLED = true;

/** Precio de lista del diagnóstico GPH (antes del descuento). */
export const DIAGNOSIS_LIST_PRICE_MXN = 2900;

/** Promoción vigente sobre evaluaciones GPH. */
export const DIAGNOSIS_PROMO = {
  discountPercent: 30,
  listPriceMxn: DIAGNOSIS_LIST_PRICE_MXN,
  /** 2900 × 0.70 */
  priceMxn: 2030,
  badge: "30% de descuento",
  badgeShort: "-30%",
  headline: "Promoción: 30% de descuento",
} as const;

export const DIAGNOSIS_PROMO_PRICE_MXN = DIAGNOSIS_PROMO.priceMxn;

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
    "Hoy puedes armar la ficha del tutor sin pagar. Lo único que se cobra ahora es el diagnóstico GPH: de $2,900 a $2,030 (−30%), evaluación presencial + 12 meses de MiFicha.",
  /** Una línea (nav, pies, cards). */
  todayShort:
    "Ficha tutor sin costo. Diagnóstico GPH $2,030 (−30% sobre $2,900, incluye 12 meses).",
  diagnosis:
    "$2,030 (−30%) · diagnóstico GPH + 12 meses de MiFicha",
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

export function formatMxn(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

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
    listPriceMxn: DIAGNOSIS_PROMO.listPriceMxn,
    listPriceLabel: "$2,900",
    priceMxn: DIAGNOSIS_PROMO.priceMxn,
    priceLabel: "$2,030",
    discountPercent: DIAGNOSIS_PROMO.discountPercent,
    promoBadge: DIAGNOSIS_PROMO.badge,
    period: "MXN · sesión + 12 meses de plataforma",
    description:
      "Diagnóstico GPH de tu hijo (sesión, ficha y lectura de entrenador) e incluye 12 meses de acceso a MiFicha. Promoción −30% por tiempo limitado.",
    includesMembershipDays: 365,
    mifichaShareMxn: GPH_PARTNERSHIP.mifichaShareMxn,
    /** Resto del cobro promocional para GPH (2030 − 600). */
    gphShareMxn: DIAGNOSIS_PROMO.priceMxn - GPH_PARTNERSHIP.mifichaShareMxn,
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
