/** Modelo comercial MiFicha — academia = canal; organizador registra gratis; familias pagan GPH. */

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
  priceLabel: "Canal academia",
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
  title: "Registro gratis",
  subtitle:
    "Registrar tu torneo en MiFicha no tiene costo. Publicas calendario y acta; las academias y tutores reciben las stats en cada ficha.",
  footnote: "Temporada 2026 · Querétaro · Abrimos cupos de acompañamiento al cargar calendario y acta.",
  costExample: null,
  plans: [
    {
      id: "registro-gratis",
      label: "Organizadores de torneo",
      priceLabel: "Gratis",
      period: "Registro · calendario · acta · fichas",
      description:
        "Conecta jornadas y datos oficiales con planteles y tutores. Sin cuota de plataforma por registrar tu torneo.",
      highlight: true,
      badge: "Sin costo",
    },
  ] satisfies OrganizerPricingPlan[],
} as const;

/** Pase Anual GPH–CRACKS — promo −30% sobre $2,900. Un solo pago anual. */
export const DIAGNOSIS_PRODUCT = {
  title: "Precio",
  subtitle:
    "Un solo pago anual: diagnóstico + proyección GPH–CRACKS 2027. Certificado formal por correo.",
  footnote:
    "Certificado PDF del Pase Anual al confirmar el pago · Mercado Pago o WhatsApp.",
  memberPriceLabel: "Membresía",
  listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
  publicPriceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
  discountPercent: DIAGNOSIS_PROMO.discountPercent,
  promoBadge: DIAGNOSIS_PROMO.badge,
  promoHeadline: "Pase Anual · 30% de descuento",
  checkoutHref: "/fut/pagar?sku=diagnosis",
  whatYouGet: [
    "Diagnóstico integral de su nivel futbolístico",
    "Lugar asegurado en visorías de abril y noviembre de 2027",
    "Posibilidad de convocatoria a torneos y selectivos CRACKS",
    "Entrenamiento mensual de especialización GPH (12 meses)",
    "Certificado formal del Pase Anual 2027 por correo al pagar",
  ],
  scope: [
    "Conocer el nivel actual y priorizar el desarrollo",
    "Acceso a oportunidades reales de proyección (visorías / selectivos)",
    "No garantiza selección ni contrato con un club profesional",
  ],
  plans: [
    {
      id: "individual",
      label: "Jugador · Pase Anual",
      listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
      priceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
      promo: true,
      period: "Un solo pago anual · vigencia 2027",
      description:
        "Diagnóstico + visorías + selectivos CRACKS + especialización mensual. $2,900 con 30% = $2,030.",
    },
    {
      id: "grupo",
      label: "Grupo o plantel",
      priceLabel: "A cotizar",
      period: "por jornada",
      description: "Varios jugadores; cada uno con su pase y certificado.",
    },
  ],
} as const;

export const SCOUT_PRICING = {
  headline: "Explorar Pro",
  basicLabel: "Búsqueda básica",
  basicPrice: "Gratis",
  proLabel: "Explorar Pro",
  proStatus: "Gratis",
  description:
    "Filtra por categoría, posición y ciudad. Solo fichas con consentimiento. El detalle completo se desbloquea con Explorar Pro (gratis).",
  unlockNote:
    "Incluye publicar fichas (tutor o representante) y ver fotos, videos, bio, contacto y ficha completa de terceros con opt-in.",
} as const;

/** Suscripción legacy para academias — desactivada en producto; conservada para Stripe futuro. */
export const LEGACY_ACADEMY_PLANS = {
  starter: { label: "Starter", priceLabel: "Plan Starter", amount: 69_900 },
  pro: { label: "Pro", priceLabel: "Plan Pro", amount: 119_900 },
  elite: { label: "Elite", priceLabel: "Plan Elite", amount: 199_900 },
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
