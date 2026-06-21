/** Modelo comercial MiFicha — academias gratis; organizador paga la temporada. */

export const ACADEMY_ACCESS = {
  headline: "Gratis para academias",
  summary:
    "Plantel, fichas, avisos al tutor y directorio — sin mensualidad. Si tu torneo usa MiFicha, el organizador activa la temporada.",
  features: [
    "Carga de plantel y consentimiento parental",
    "Ficha por jugador sincronizada con el acta",
    "Avisos automáticos al tutor tras cada jornada",
    "Aparición en directorio cuando certificas tu academia",
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

/** Precios de arranque en Querétaro — accesibles para primeros torneos. */
export const ORGANIZER_PRICING = {
  title: "Precios de arranque",
  subtitle:
    "Las academias no pagan. El torneo contrata MiFicha por temporada — puedes repartir el costo en la inscripción si quieres.",
  footnote:
    "Precios piloto en Querétaro · Temporada 2026. Cupos limitados para torneos fundadores.",
  plans: [
    {
      id: "piloto-fundador",
      label: "Torneo fundador",
      priceLabel: "Gratis",
      period: "1 categoría · 1 temporada",
      description:
        "Para el primer torneo que active calendario + acta en MiFicha. Cupos muy limitados.",
      highlight: true,
      badge: "Piloto",
    },
    {
      id: "temporada-categoria",
      label: "Por categoría",
      priceLabel: "$999",
      period: "MXN / categoría / temporada",
      description:
        "Calendario oficial, acta, fichas para todas las academias inscritas y visibilidad en Explorar.",
    },
    {
      id: "por-jugador",
      label: "Por jugador",
      priceLabel: "$10",
      period: "MXN / jugador / temporada",
      description:
        "Ideal si prefieres sumarlo a la cuota de inscripción del torneo.",
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
    "Búsqueda avanzada, listas guardadas y alertas por categoría — cuando la red tenga masa crítica. El directorio público sigue abierto.",
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
