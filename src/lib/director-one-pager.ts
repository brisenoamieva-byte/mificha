export const DIRECTOR_ONE_PAGER = {
  eyebrow: "Futbol escolar · Querétaro",
  title: "MiFicha",
  tagline: "Ficha digital por jugador. Stats del acta oficial. Aviso al padre.",
  problemTitle: "Hoy",
  problems: [
    "Todo queda en WhatsApp o Excel",
    "Cada escuela reporta números distintos",
    "El jugador no tiene historial verificable",
  ],
  howTitle: "Cómo funciona",
  howSteps: [
    {
      step: "1",
      title: "Academia",
      detail: "Plantel y contacto del tutor",
    },
    {
      step: "2",
      title: "Organizador",
      detail: "Calendario, marcador y acta",
    },
    {
      step: "3",
      title: "MiFicha",
      detail: "Sincroniza cada ficha y avisa al padre",
    },
  ],
  stats: [
    { value: "Acta", label: "Fuente oficial" },
    { value: "Auto", label: "Aviso al tutor" },
    { value: "100", label: "Passport Score" },
  ],
  schoolTitle: "Para tu colegio",
  schoolSubtitle: "Complementa tu torneo o liga. No manejamos inscripciones.",
  schoolPoints: [
    "No reescribes el partido: el acta oficial alimenta cada ficha.",
    "Menos mensajes de padres pidiendo stats cada fin de semana.",
    "Plantel visible en el directorio con academia certificada.",
    "Stats comparables con otras escuelas de tu categoría.",
  ],
  nextTitle: "Siguiente paso",
  nextPoints: [
    "Demo con tu plantel · 15 min",
    "Primera jornada con acta oficial",
    "Padres reciben link automático",
  ],
  cta: "¿Lo vemos en vivo?",
  contact: {
    name: "Ricardo Briseño",
    email: "hola@mificha.mx",
    web: "mificha.mx",
  },
} as const;

export function buildDirectorOnePagerPlainText(options?: {
  academyName?: string;
  contactName?: string;
  matchDate?: string;
}) {
  const greeting = options?.contactName?.trim()
    ? `Hola ${options.contactName.trim()},`
    : "Hola,";
  const academy = options?.academyName?.trim();
  const match = options?.matchDate?.trim();

  const lines = [
    greeting,
    "",
    "MiFicha · ficha digital por jugador. Stats del acta oficial. Aviso al padre.",
    "",
    "Hoy:",
    "· Todo queda en WhatsApp o Excel",
    "· Cada escuela reporta números distintos",
    "· El jugador no tiene historial verificable",
    "",
    "Cómo funciona:",
    "1. Academia: plantel y contacto del tutor",
    "2. Organizador: calendario, marcador y acta",
    "3. MiFicha: sincroniza cada ficha y avisa al padre",
    "",
    "Para tu colegio:",
    "· No reescribes el partido: el acta alimenta cada ficha",
    "· Menos WhatsApp de padres pidiendo stats",
    "· Directorio con academia certificada",
    "· Stats comparables en tu categoría",
    "",
    "¿Lo vemos en vivo? Demo 15 min con tu plantel.",
    "",
    ...(match ? [`Ideal antes del partido del ${match}.`, ""] : []),
    ...(academy ? [`Para ${academy}.`, ""] : []),
    "Ricardo · mificha.mx · hola@mificha.mx",
  ];

  return lines.join("\n");
}
