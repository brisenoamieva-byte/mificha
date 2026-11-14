/** Modelo comercial MiFicha — academia = canal; organizador paga temporada; familias pagan GPH. */

import { DIAGNOSIS_PROMO, FAMILY_PRODUCTS } from "@/lib/gph-commerce";
import { ACADEMY_COMMERCIAL } from "@/lib/academy-role";
import { ACADEMY_BILLING_PROMO_FREE } from "@/lib/membership-promo";

/**
 * Copy academia (sin importar academy-membership: evita ciclo
 * pricing ↔ mercadopago ↔ academy-membership en el build).
 */
export const ACADEMY_ACCESS = {
  headline: ACADEMY_COMMERCIAL.headline,
  summary: ACADEMY_COMMERCIAL.summary,
  features: [...ACADEMY_COMMERCIAL.features],
  priceUsd: ACADEMY_COMMERCIAL.futurePriceUsd,
  priceLabel: `$${ACADEMY_COMMERCIAL.futurePriceUsd}`,
  promoFree: ACADEMY_BILLING_PROMO_FREE,
} as const;

export interface OrganizerPricingPlan {
  id: string;
  label: string;
  priceLabel: string;
  period: string;
  description: string;
  highlight?: boolean;
  badge?: string;
}

export const ORGANIZER_PRICING = {
  title: "Precios",
  subtitle:
    "Las academias operan plantel y partidos sin cuota. El organizador elige tarifa por categoría o por jugador — puedes incluirla en la inscripción del torneo.",
  footnote: "Temporada 2026 · Querétaro · Cupos limitados para torneos fundadores.",
  costExample: {
    label: "Ejemplo por jugador",
    summary: "12 equipos × 18 jugadores = 216 → $4,320 MXN ($20/jugador).",
    note: "Súmalo a la cuota de inscripción si prefieres.",
  },
  plans: [
    {
      id: "piloto-fundador",
      label: "Torneo fundador",
      priceLabel: "Gratis",
      period: "1 categoría · 1 torneo",
      description: "Primera temporada con MiFicha. Te ayudamos a cargar calendario y acta.",
      highlight: true,
      badge: "Piloto",
    },
    {
      id: "temporada-categoria",
      label: "Por categoría",
      priceLabel: "$1,999",
      period: "MXN / categoría / torneo",
      description: "Calendario, acta, fichas de todas las academias y visibilidad en Explorar.",
    },
    {
      id: "por-jugador",
      label: "Por jugador",
      priceLabel: "$20",
      period: "MXN / jugador / torneo",
      description: "Pagas solo por jugadores inscritos. Ideal para sumar a la cuota del torneo.",
    },
  ] satisfies OrganizerPricingPlan[],
} as const;

/** Evaluaciones GPH — promo −30% sobre $2,900. Incluye 12 meses de MiFicha. */
export const DIAGNOSIS_PRODUCT = {
  title: "Precio",
  subtitle: "Un jugador o un grupo. El informe queda en la ficha de MiFicha.",
  footnote: "Incluye 12 meses de MiFicha · Mercado Pago o WhatsApp.",
  memberPriceLabel: "$1,200",
  listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
  publicPriceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
  discountPercent: DIAGNOSIS_PROMO.discountPercent,
  promoBadge: DIAGNOSIS_PROMO.badge,
  promoHeadline: DIAGNOSIS_PROMO.headline,
  checkoutHref: "/fut/pagar?sku=diagnosis",
  whatYouGet: [
    "Pruebas: técnica, táctica, físico, mental y hábitos",
    "Escala 1–5, etapa de desarrollo y 3–5 objetivos",
    "Informe en la ficha del jugador (mificha.mx)",
    "12 meses de plataforma para seguimiento",
  ],
  scope: [
    "Orientar entrenamiento en casa y con la academia",
    "Antes de visorías, cambio de categoría o decisiones de temporada",
    "No promete beca ni selección: mide y prioriza el desarrollo",
  ],
  plans: [
    {
      id: "individual",
      label: "Jugador",
      listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
      priceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
      promo: true,
      period: "MXN · sesión + 12 meses MiFicha",
      description: "Diagnóstico completo e informe ligado a la ficha.",
    },
    {
      id: "grupo",
      label: "Grupo o plantel",
      priceLabel: "A cotizar",
      period: "por jornada",
      description: "Varios jugadores; cada uno con su ficha y plan.",
    },
  ],
} as const;

export const SCOUT_PRICING = {
  headline: "Explorar · membresía persona",
  basicLabel: "Búsqueda básica",
  basicPrice: "Gratis",
  proLabel: "Membresía persona · Explorar Pro",
  proStatus: "Gratis por tiempo limitado · después $50 USD/año",
  description:
    "Filtra por categoría, posición y ciudad. Solo fichas con consentimiento. El detalle completo se desbloquea con la membresía persona (gratis por tiempo limitado; después $50 USD/año).",
  unlockNote:
    "Incluye publicar fichas (tutor o representante) y ver fotos, videos, bio, contacto y ficha completa de terceros con opt-in.",
} as const;

/** Suscripción legacy para academias — desactivada en producto; conservada para Stripe futuro. */
export const LEGACY_ACADEMY_PLANS = {
  starter: { label: "Starter", priceLabel: "$699/mes", amount: 69_900 },
  pro: { label: "Pro", priceLabel: "$1,199/mes", amount: 119_900 },
  elite: { label: "Elite", priceLabel: "$1,999/mes", amount: 199_900 },
} as const;

/** Cobro anual academia ($150). Env fuerza on/off; si no, sigue ACADEMY_ACCESS.promoFree. */
export function isAcademyBillingEnabled() {
  if (process.env.NEXT_PUBLIC_ACADEMY_BILLING === "true") return true;
  if (process.env.NEXT_PUBLIC_ACADEMY_BILLING === "false") return false;
  return !ACADEMY_ACCESS.promoFree;
}

export function formatOrganizerPriceMailtoSubject(tournamentName?: string) {
  return tournamentName?.trim()
    ? `MiFicha · Temporada ${tournamentName.trim()}`
    : "MiFicha · Temporada torneo Querétaro";
}
