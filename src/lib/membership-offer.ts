/** Qué ofrece MiFicha a la familia con la membresía anual. */

export const MEMBERSHIP_OFFER = {
  headline: "Seguimiento del jugador + puertas a oportunidades reales",
  headlineLead: "Seguimiento del jugador +",
  headlineHook: "puertas a oportunidades reales",
  summary:
    "Ficha del hijo, seguimiento y visibilidad ante agentes en Explorar — más visorías, torneos y GPH en una sola cuenta.",
  priceLabel: "$1,200",
  pricePeriod: "MXN al año",
  specializationLimit:
    "1 ciclo de especialización al mes (o el cupo que publique GPH). Extra se cotiza aparte.",
  benefits: [
    {
      id: "seguimiento",
      title: "Seguimiento digital del desarrollo",
      detail:
        "Ficha con fotos, videos e historia; opt-in a Explorar para que agentes te vean; después, historial de torneo y lectura GPH en el mismo lugar.",
      status: "piloto" as const,
    },
    {
      id: "visorias",
      title: "Visorías con equipos de Primera División",
      detail:
        "Fechas como la de Querétaro con Chivas y Santos. El miembro recibe aviso y puede presentar la ficha del jugador.",
      status: "vivo" as const,
    },
    {
      id: "torneos",
      title: "Convocatorias a torneos de alto nivel",
      detail:
        "Avisos curados de torneos recomendados por GPH/MiFicha cuando haya convocatoria.",
      status: "membresia" as const,
    },
    {
      id: "eventos",
      title: "Eventos deportivos con descuento",
      detail:
        "Precio de miembro en clínicas, jornadas y eventos GPH/CRACKS cuando haya cupo publicado.",
      status: "membresia" as const,
    },
    {
      id: "especializacion",
      title: "Entrenamiento de especialización gratis",
      detail:
        "Incluido con límite: 1 ciclo al mes según calendario GPH. Sesiones extra se cotizan aparte.",
      status: "membresia" as const,
    },
  ],
} as const;

export const MEMBERSHIP_STATUS_LABEL = {
  piloto: "En piloto",
  vivo: "Disponible",
  membresia: "En desarrollo",
} as const;

export const MEMBERSHIP_ROADMAP_NOTE =
  "Más adelante: convocatorias a torneos, clínicas con precio de miembro y especialización GPH.";

/** Beneficios listos para la home (sin placeholders “en desarrollo”). */
export function getLiveMembershipBenefits() {
  return MEMBERSHIP_OFFER.benefits.filter((item) => item.status !== "membresia");
}
