/** Qué ofrece MiFicha a la familia con la membresía anual. */

export const MEMBERSHIP_OFFER = {
  headline: "Seguimiento del jugador + puertas a oportunidades reales",
  summary:
    "MiFicha no es una red social. Es el expediente del hijo y el acceso a visorías, torneos, eventos y entrenamiento con GPH.",
  priceLabel: "$1,200",
  pricePeriod: "MXN al año",
  pilotNote:
    "Piloto gratuito ahora: puedes armar la ficha del tutor sin pagar. El cobro anual se activa al cerrar el piloto.",
  specializationLimit:
    "1 ciclo de especialización al mes (o el cupo que publique GPH). Extra se cotiza aparte.",
  benefits: [
    {
      id: "seguimiento",
      title: "Seguimiento digital del desarrollo",
      detail:
        "Ficha del tutor con fotos, videos, historia y, después, el historial de torneo y la lectura GPH en el mismo lugar.",
      status: "piloto" as const,
    },
    {
      id: "torneos",
      title: "Convocatorias a torneos de alto nivel",
      detail:
        "Avisos curados por GPH/MiFicha. No es un mural abierto: solo convocatorias que ustedes operan o recomiendan.",
      status: "membresia" as const,
    },
    {
      id: "visorias",
      title: "Visorías con equipos de Primera División",
      detail:
        "Fechas como la de Querétaro con Chivas y Santos. El miembro recibe aviso y puede presentar la ficha del jugador.",
      status: "vivo" as const,
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
        "Incluido con límite: 1 ciclo al mes según calendario GPH. Sesiones extra se cobran (fuente de ingreso #1).",
      status: "membresia" as const,
    },
  ],
} as const;

export const MEMBERSHIP_STATUS_LABEL = {
  piloto: "En piloto",
  vivo: "Disponible",
  membresia: "Con membresía",
} as const;
