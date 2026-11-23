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
    ? "Familias · ficha del jugador"
    : "Familias · membresía anual",
  /** Explicación completa (sección membresía, página). */
  today:
    "La plataforma está abierta para que el tutor arme la ficha del jugador. Lo que se cobra aparte es el diagnóstico GPH (evaluación presencial + 12 meses de MiFicha).",
  /** Una línea (nav, pies, cards). */
  todayShort:
    "Ficha del jugador gratis. Diagnóstico GPH opcional (incluye 12 meses).",
  diagnosis: "Diagnóstico GPH · evaluación presencial + 12 meses de MiFicha",
  /** Solo pie discreto; no va en el hero. */
  laterNote:
    "La ficha del jugador es gratis. El diagnóstico GPH se cotiza aparte.",
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
    period: "MXN · sesión presencial en Querétaro + 12 meses de plataforma",
    locationLabel: "Querétaro",
    locationDetail: "Sesión presencial en Querétaro (fecha y sede se coordinan al pagar o por WhatsApp).",
    description:
      "Es una evaluación presencial con metodología GPH: medimos técnica, táctica, físico, mental y hábitos. Sales con etapa de desarrollo, fortalezas, 3–5 objetivos claros y el informe en MiFicha — más 12 meses de acceso para seguimiento. Promoción −30%.",
    highlights: [
      "Presencial en Querétaro",
      "Pruebas 1–5 + etapa de desarrollo",
      "Ficha visual y lectura de entrenador",
      "12 meses de MiFicha incluidos",
    ],
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
