export const ORGANIZER_ONE_PAGER = {
  eyebrow: "Torneos interescolares · Querétaro",
  title: "MiFicha para organizadores",
  tagline:
    "Calendario oficial, acta verificada y ficha por jugador. MiFicha sincroniza stats y avisa a los padres.",
  problemTitle: "Lo que pasa hoy en torneos particulares",
  problems: [
    "Padres y directores te escriben el domingo pidiendo stats que no tienes centralizadas.",
    "Cada escuela manda números distintos por WhatsApp — disputas de goleadores y tarjetas.",
    "El torneo termina y no queda evidencia verificable para visorías ni para vender la siguiente edición.",
    "Compites con otros organizadores solo por precio de inscripción, no por valor agregado.",
    "Promover «stats oficiales» suena bien, pero nadie tiene plataforma que lo respalde.",
  ],
  solutionTitle: "Qué es MiFicha (en una frase)",
  solution:
    "MiFicha publica jornadas, marcador y acta como fuente oficial. Cruza esos datos con cada plantel y avisa al padre. No sustituye tu inscripción ni tu reglamento.",
  demoTitle: "Así funciona",
  demoSubtitle: "Ejemplo en Querétaro: jornada, acta y ficha del jugador.",
  demoMatch: {
    league: "Liga Interescolar Querétaro",
    category: "Sub-15",
    opponent: "Instituto Cervantes",
    jornada: "Jornada 11",
    date: "14 mar 2026 · 10:00",
    venue: "Unidad Deportiva Jurica",
  },
  demoSteps: [
    "Publicas calendario, marcador y acta.",
    "MiFicha sincroniza stats con cada plantel.",
    "El padre recibe link automático a la ficha.",
  ],
  demoFichaHref: "/j/santiago-hernandez-demo",
  demoExploreHref: "/explorar",
  academyKitTitle: "Guión para academias",
  academyKitDescription: "Copia y pega en WhatsApp cuando abras inscripciones.",
  askTitle: "Qué necesitamos de ti",
  askPoints: [
    "Calendario de jornadas — lo cargamos contigo al inicio.",
    "Marcador y acta oficial tras cada partido.",
    "Que academias activen plantel (usa el guión de abajo).",
  ],
  governanceTitle: "Quién hace qué",
  governancePoints: [
    "Tú: calendario, marcador y acta.",
    "Academia: plantel, consentimiento y contacto del tutor.",
    "MiFicha: sincroniza fichas y avisa al tutor.",
  ],
  cta: "¿Agendamos 20 min para ver tu calendario en MiFicha?",
  contact: {
    name: "Ricardo Briseño",
    email: "hola@mificha.mx",
    web: "mificha.mx/organizadores",
  },
} as const;

export function buildOrganizerOnePagerPlainText(options?: {
  tournamentName?: string;
  contactName?: string;
  seasonLabel?: string;
}) {
  const greeting = options?.contactName?.trim()
    ? `Hola ${options.contactName.trim()},`
    : "Hola,";
  const tournament = options?.tournamentName?.trim();
  const season = options?.seasonLabel?.trim();

  return [
    greeting,
    "",
    "Te escribo por MiFicha, plataforma para torneos interescolares en Querétaro.",
    "",
    "Propuesta para tu torneo:",
    "· Tú publicas calendario, marcador y acta (fuente oficial).",
    "· MiFicha sincroniza el acta con cada plantel; el padre recibe ficha automática.",
    "· Tu torneo aparece en la red con stats verificadas — diferenciador real vs otros organizadores.",
    "",
    "No competimos por inscripciones. Sumamos valor para que academias y padres confíen en tu torneo.",
    "",
    ...(tournament ? [`Pensado para ${tournament}.`, ""] : []),
    ...(season ? [`Temporada ${season}.`, ""] : []),
    "¿20 min esta semana para ver cómo cargaríamos tu jornada?",
    "",
    "Ricardo · mificha.mx · hola@mificha.mx",
  ].join("\n");
}

export function buildOrganizerAcademyBlastText(options: {
  tournamentName: string;
  signupUrl?: string;
}) {
  const url = options.signupUrl ?? "https://mificha.mx/signup";
  return [
    `Torneo ${options.tournamentName} · MiFicha activo`,
    "",
    "Este torneo usa MiFicha para fichas verificadas por jugador.",
    "",
    "Tu academia debe:",
    "1. Crear cuenta y cargar plantel",
    "2. Activar consentimiento y contacto del tutor",
    "3. Mantener plantel y consentimiento al día — MiFicha avisa al tutor al sincronizar el acta",
    "",
    `Registro: ${url}`,
    "Dudas: hola@mificha.mx",
  ].join("\n");
}
