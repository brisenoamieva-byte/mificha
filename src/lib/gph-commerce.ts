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
 * Producto de pago: un solo cobro anual = diagnóstico + beneficios de proyección.
 * El certificado PDF formal se envía al confirmar el pago.
 */
export const GPH_ANNUAL_PASS = {
  eyebrow: "Pase Anual de Proyección GPH–CRACKS",
  title: "Pase Anual de Proyección GPH–CRACKS",
  lead:
    "Más que un diagnóstico: un proceso para conocer el nivel actual de tu hijo, fortalecer su desarrollo y acercarlo a oportunidades reales dentro del fútbol.",
  closing:
    "Es un solo pago anual. Conoce dónde está hoy tu hijo y construyamos juntos el camino para llevarlo más lejos.",
  certificateNote:
    "Al pagar recibes por correo el certificado formal del Pase Anual 2027 (PDF).",
  benefits: [
    "Diagnóstico integral: nivel actual y áreas de desarrollo",
    "Visorías 2027: lugar asegurado en abril y noviembre",
    "Selectivos CRACKS: posibilidad de convocatoria a torneos",
    "Bono GPH: 1 entrenamiento de especialización al mes",
  ],
  flyerSrc: "/marketing/gph/pase-anual-proyeccion-2027.jpg",
  flyerAlt: "Pase Anual de Proyección GPH–CRACKS 2027",
  clubsDisclaimer:
    "Clubes mostrados: antecedentes de procesos anteriores. Invitados 2027 por confirmar. La participación no garantiza selección.",
  schedulePhoneDisplay: "+52 446 132 2207",
} as const;

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
    "La plataforma está abierta para que el tutor arme la ficha del jugador. Lo que se cobra aparte es el Pase Anual GPH–CRACKS (diagnóstico + proyección 2027).",
  /** Una línea (nav, pies, cards). */
  todayShort:
    "Ficha gratis. Pase Anual GPH–CRACKS opcional (diagnóstico + proyección).",
  diagnosis: "Pase Anual GPH–CRACKS · diagnóstico + proyección 2027",
  /** Solo pie discreto; no va en el hero. */
  laterNote:
    "La ficha del jugador es gratis. El Pase Anual GPH–CRACKS se cotiza aparte.",
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
    title: "Pase Anual GPH–CRACKS 2027",
    publicName: "Pase Anual GPH–CRACKS",
    listPriceMxn: DIAGNOSIS_PROMO.listPriceMxn,
    listPriceLabel: "$2,900",
    priceMxn: DIAGNOSIS_PROMO.priceMxn,
    priceLabel: "$2,030",
    discountPercent: DIAGNOSIS_PROMO.discountPercent,
    promoBadge: DIAGNOSIS_PROMO.badge,
    period: "MXN · un solo pago anual · vigencia 2027",
    locationLabel: "Querétaro",
    locationDetail:
      "Diagnóstico presencial en Querétaro (fecha y sede se coordinan al pagar o por WhatsApp).",
    description: `${GPH_ANNUAL_PASS.lead} ${GPH_ANNUAL_PASS.certificateNote} Promoción −30%.`,
    highlights: [
      ...GPH_ANNUAL_PASS.benefits,
      GPH_ANNUAL_PASS.certificateNote,
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
