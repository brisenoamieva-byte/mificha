/** Qué ofrece MiFicha a la familia (cuenta persona / Explorar Pro). Hoy: gratis. */

export const MEMBERSHIP_OFFER = {
  headline: "La ficha de tu hijo, en un solo lugar",
  headlineLead: "La ficha de tu hijo,",
  headlineHook: "en un solo lugar",
  summary:
    "Arma la ficha, decide si sale en Explorar y recibe avisos de visorías y servicios GPH. Gratis.",
  priceLabel: "Gratis",
  pricePeriod: "sin costo",
  specializationLimit:
    "La especialización GPH y el diagnóstico presencial se cotizan aparte cuando haya cupo.",
  benefits: [
    {
      id: "seguimiento",
      title: "Ficha digital del jugador",
      detail:
        "Fotos, videos e historia. Tú armas la ficha y tú decides si sale en Explorar.",
      status: "piloto" as const,
    },
    {
      id: "visorias",
      title: "Avisos de visorías",
      detail:
        "Fechas como Querétaro con Chivas y Santos. Puedes presentar la ficha del jugador.",
      status: "vivo" as const,
    },
    {
      id: "torneos",
      title: "Convocatorias a torneos",
      detail:
        "Avisos curados de torneos recomendados por GPH/MiFicha cuando haya convocatoria.",
      status: "membresia" as const,
    },
    {
      id: "eventos",
      title: "Eventos GPH / CRACKS",
      detail:
        "Clínicas, jornadas y eventos cuando haya cupo publicado.",
      status: "membresia" as const,
    },
    {
      id: "especializacion",
      title: "Especialización GPH",
      detail:
        "Cupos y precios según calendario GPH. No viene incluida en la ficha gratis.",
      status: "membresia" as const,
    },
  ],
} as const;

export const MEMBERSHIP_STATUS_LABEL = {
  piloto: "Disponible",
  vivo: "Disponible",
  membresia: "En desarrollo",
} as const;

export const MEMBERSHIP_ROADMAP_NOTE =
  "Más adelante: convocatorias a torneos, clínicas y especialización GPH con cupo publicado.";

/** Beneficios listos para la home (sin placeholders “en desarrollo”). */
export function getLiveMembershipBenefits() {
  return MEMBERSHIP_OFFER.benefits.filter((item) => item.status !== "membresia");
}
