/**
 * Rol de producto de la academia en MiFicha.
 * Fuente única para dashboard, onboarding y copy comercial.
 *
 * Regla: la academia opera el dato oficial de plantel/partido.
 * El tutor opera la carta y la proyección. El puente es el código MF.
 * El ingreso cercano vive en familias (diagnóstico GPH), no en cuota del club.
 */

export const ACADEMY_ROLE = {
  eyebrow: "Tu rol en MiFicha",
  headline: "Operas el rendimiento oficial",
  summary:
    "La academia carga plantel y partidos. El tutor arma la carta. El código MF evita dos fichas del mismo jugador.",
  split: {
    academy: {
      title: "Academia",
      lines: [
        "Plantel (alta masiva o uno a uno)",
        "Partidos: minutos, goles, asistencias",
        "Contacto del tutor y avisos post-partido",
        "Vínculo MF con la ficha del tutor",
      ],
    },
    tutor: {
      title: "Tutor / familia",
      lines: [
        "Carta, fotos, historia y material",
        "Consentimiento para Explorar",
        "Diagnóstico GPH y seguimiento",
        "Comparte el mismo código MF",
      ],
    },
  },
  loop: [
    {
      id: "plantel",
      title: "Plantel",
      detail: "Importa el roster. Si el tutor ya tiene MF-, conéctalo al crear.",
      href: "/fut/dashboard/plantel",
      cta: "Ir a plantel",
    },
    {
      id: "partidos",
      title: "Partidos",
      detail: "Captura o sincroniza el acta: eso vuelve creíble el rendimiento.",
      href: "/fut/dashboard/partidos",
      cta: "Ver partidos",
    },
    {
      id: "tutores",
      title: "Avisos",
      detail: "Manda el link al padre. Tras cada partido, MiFicha puede avisar solo.",
      href: "/fut/dashboard/plantel/tutores",
      cta: "Avisos a tutores",
    },
  ],
  outOfScope: [
    "No es CRM escolar ni control de pagos de colegiatura",
    "No sustituye la red social del club",
    "No exige cobro a la academia para operar el núcleo",
  ],
  billingNote:
    "Plantel, partidos, MF y avisos van gratis mientras el cuello de botella sea densidad de alumnos. El valor de pago está en el diagnóstico GPH para familias.",
} as const;

/** Copy comercial alineado al rol (canal, no cliente de cuota). */
export const ACADEMY_COMMERCIAL = {
  headline: "Academia · canal gratuito",
  summary:
    "Plantel, partidos, código MF y avisos a tutores sin cuota. Cuando haya densidad, el valor premium (si aplica) será aparte; hoy el ingreso es diagnóstico GPH a familias.",
  features: [
    "Plantel y vínculo MF con ficha tutor",
    "Partidos y stats oficiales en la ficha",
    "Avisos automáticos al tutor",
  ],
  /** Precio de referencia futuro; no es el pitch principal. */
  futurePriceUsd: 150,
  futurePriceHint: "Referencia futura · $150 USD/año (apagada mientras el piloto necesite academias activas)",
} as const;
