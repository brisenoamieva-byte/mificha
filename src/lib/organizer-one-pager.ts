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
  demoSubtitle: "Calendario, acta y ficha del jugador en tres pasos.",
  demoSteps: [
    "Publicas calendario, marcador y acta.",
    "MiFicha sincroniza stats con cada plantel.",
    "El padre recibe link automático a la ficha.",
  ],
  demoExploreHref: "/fut/explorar",
  academyKitTitle: "Mensaje listo para tus academias",
  academyKitDescription:
    "Esto no es para ti: es un texto que puedes reenviar a las escuelas cuando abras inscripciones, para que carguen su plantel en MiFicha.",
  askTitle: "Qué necesitamos de ti",
  askPoints: [
    "Calendario de jornadas — lo cargamos contigo al inicio.",
    "Marcador y acta oficial tras cada partido.",
    "Que las academias activen su plantel en MiFicha.",
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
    phoneDisplay: "442 155 6155",
    web: "mificha.mx/fut/organizadores",
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
    "Ricardo · WhatsApp 442 155 6155 · hola@mificha.mx · mificha.mx",
  ].join("\n");
}

export function buildOrganizerAcademyBlastText(options: {
  tournamentName: string;
  signupUrl?: string;
}) {
  const name = options.tournamentName.trim() || "nuestro torneo";
  const url = options.signupUrl ?? "https://mificha.mx/fut/signup";
  return [
    `Hola, les escribimos por el torneo ${name}.`,
    "",
    "Este torneo va a usar MiFicha para las fichas de los jugadores (calendario, acta y stats).",
    "",
    "Por favor, en su academia:",
    "1. Creen su cuenta y carguen el plantel",
    "2. Activen el consentimiento y el contacto del tutor de cada jugador",
    "3. Mantengan el plantel al día",
    "",
    `Registro de academia: ${url}`,
    "Si tienen dudas técnicas: hola@mificha.mx",
  ].join("\n");
}
