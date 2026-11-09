/** Modelo comercial MiFicha — academias gratis; organizador paga la temporada. */

import { DIAGNOSIS_PROMO, FAMILY_PRODUCTS } from "@/lib/gph-commerce";

export const ACADEMY_ACCESS = {
  headline: "Gratis para academias",
  summary:
    "Plantel, fichas y avisos al tutor — sin costo para la escuela. El torneo activa la temporada.",
  features: [
    "Plantel y consentimiento parental",
    "Ficha sincronizada con el acta del torneo",
    "Avisos automáticos al tutor",
  ],
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
    "Las academias no pagan. Elige tarifa por categoría o por jugador — puedes incluirla en la inscripción del torneo.",
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
  title: "Evaluaciones",
  subtitle:
    "Sesión presencial con metodología GPH. El informe, la etapa y el plan quedan en mificha.mx para que la familia dé seguimiento.",
  footnote: `${FAMILY_PRODUCTS.diagnosis.priceLabel} (−${DIAGNOSIS_PROMO.discountPercent}% sobre ${FAMILY_PRODUCTS.diagnosis.listPriceLabel}) · sesión GPH + 12 meses de MiFicha · Mercado Pago o WhatsApp.`,
  memberPriceLabel: "$1,200",
  listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
  publicPriceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
  discountPercent: DIAGNOSIS_PROMO.discountPercent,
  promoBadge: DIAGNOSIS_PROMO.badge,
  promoHeadline: DIAGNOSIS_PROMO.headline,
  checkoutHref: "/fut/pagar?sku=diagnosis",
  whatYouGet: [
    "Sesión presencial con pruebas de técnica, táctica, físico, mental y hábitos",
    "Calificación 1–5 y etapa de desarrollo (punto de partida claro, sin etiquetas)",
    "Ficha visual + lectura de entrenador con 3 a 5 objetivos concretos",
    "Informe digital ligado a la ficha del jugador en mificha.mx",
    "12 meses de acceso a MiFicha para seguimiento y material del tutor",
  ],
  scope: [
    "Sirve para orientar el entrenamiento en casa y con la academia",
    "Útil antes de visorías, cambios de categoría o decisiones de temporada",
    "No promete beca, selección ni contrato: mide y prioriza el desarrollo",
    "No requiere que la academia esté inscrita en MiFicha para contratarlo",
  ],
  plans: [
    {
      id: "individual",
      label: "Jugador",
      listPriceLabel: FAMILY_PRODUCTS.diagnosis.listPriceLabel,
      priceLabel: FAMILY_PRODUCTS.diagnosis.priceLabel,
      promo: true,
      period: "MXN · evaluación + 12 meses MiFicha",
      description:
        "Diagnóstico GPH completo: sesión, ficha, lectura de entrenador y un año de plataforma para dar seguimiento. Promoción −30% por tiempo limitado.",
    },
    {
      id: "grupo",
      label: "Grupo o plantel",
      priceLabel: "A cotizar",
      period: "por jornada",
      description:
        "Varios jugadores en una misma sesión. Cada uno queda con su ficha y plan en la plataforma.",
    },
  ],
} as const;

export const SCOUT_PRICING = {
  headline: "Explorar para visorías",
  basicLabel: "Directorio básico",
  basicPrice: "Gratis",
  proLabel: "Explorar Pro",
  proStatus: "Próximamente",
  description:
    "Búsqueda avanzada, listas guardadas y alertas por categoría — cuando la red tenga masa crítica.",
} as const;

/** Suscripción legacy para academias — desactivada en producto; conservada para Stripe futuro. */
export const LEGACY_ACADEMY_PLANS = {
  starter: { label: "Starter", priceLabel: "$699/mes", amount: 69_900 },
  pro: { label: "Pro", priceLabel: "$1,199/mes", amount: 119_900 },
  elite: { label: "Elite", priceLabel: "$1,999/mes", amount: 199_900 },
} as const;

export function isAcademyBillingEnabled() {
  return process.env.NEXT_PUBLIC_ACADEMY_BILLING === "true";
}

export function formatOrganizerPriceMailtoSubject(tournamentName?: string) {
  return tournamentName?.trim()
    ? `MiFicha · Temporada ${tournamentName.trim()}`
    : "MiFicha · Temporada torneo Querétaro";
}
