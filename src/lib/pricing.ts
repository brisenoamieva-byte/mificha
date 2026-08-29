/** Modelo comercial MiFicha — academias gratis; organizador paga la temporada. */

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

/** Evaluaciones GPH — producto aparte de torneo y academia. Sin Stripe por ahora. */
export const DIAGNOSIS_PRODUCT = {
  title: "Evaluaciones",
  subtitle:
    "Se contratan por su cuenta. No forman parte de la cuota del torneo ni de la cuenta gratis de la academia.",
  footnote: "Metodología GPH · ficha y seguimiento en mificha.mx · cotización por WhatsApp.",
  plans: [
    {
      id: "individual",
      label: "Jugador",
      priceLabel: "A cotizar",
      period: "por evaluación",
      description:
        "Diagnóstico de tu hijo: sesión GPH, ficha visual, lectura de entrenador y seguimiento de etapa en MiFicha.",
    },
    {
      id: "grupo",
      label: "Grupo o plantel",
      priceLabel: "A cotizar",
      period: "por jornada",
      description:
        "Varios jugadores en una misma sesión. Cada uno queda con su ficha y plan en la plataforma.",
    },
  ] satisfies OrganizerPricingPlan[],
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
