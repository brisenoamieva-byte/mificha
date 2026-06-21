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
  demoTitle: "Así se ve tu torneo",
  demoSubtitle:
    "Ejemplo con liga interescolar en Querétaro: calendario, acta y ficha por jugador.",
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
  pilotTitle: "Piloto sin riesgo",
  pilotPoints: [
    "Torneo fundador gratis: 1 categoría, 1 temporada — cupos muy limitados.",
    "Cargamos tu calendario contigo antes de la primera jornada.",
    "Post-partido: unos 15 min para marcador y acta — lo mismo que ya anotas.",
  ],
  boundariesTitle: "Qué no hacemos",
  boundariesPoints: [
    "No cobramos inscripciones ni comisión por equipo.",
    "No dejamos que academias editen marcador ni acta.",
    "No competimos por tus inscripciones.",
    "No cobramos a padres ni academias.",
  ],
  academyKitTitle: "Mensaje para academias",
  academyKitDescription:
    "Cuando actives la temporada, manda esto en tu grupo de WhatsApp con directores.",
  winTitle: "Qué gana tu torneo",
  winPoints: [
    {
      title: "Diferenciador real",
      description: "Torneo con ficha MiFicha y stats verificadas por categoría.",
    },
    {
      title: "Menos ruido post-jornada",
      description: "El padre consulta su link; no te escribe a ti el domingo.",
    },
    {
      title: "Visibilidad del torneo",
      description: "Calendario y resultados en mificha.mx/explorar — refuerza la marca de tu torneo.",
    },
    {
      title: "Credibilidad",
      description: "El acta la registra el organizador, no la escuela rival.",
    },
  ],
  askTitle: "Qué necesitamos de ti",
  askPoints: [
    "Calendario de jornadas (rivales, fecha, sede, categoría) — lo cargamos juntos una vez por temporada.",
    "Marcador y acta oficial tras cada jornada.",
    "Promoción a academias inscritas: «Activa plantel en MiFicha» — nosotros damos el guión y el link.",
    "Logo y nombre del torneo en la temporada MiFicha (co-branding en la red escolar).",
  ],
  governanceTitle: "Quién hace qué",
  governancePoints: [
    "Organizador: calendario, marcador final y acta (goles, asistencias, tarjetas, minutos).",
    "Academia: plantel, consentimiento y contacto del tutor.",
    "MiFicha: cruza acta con plantel, progreso de ficha, insignias y avisos al tutor.",
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
