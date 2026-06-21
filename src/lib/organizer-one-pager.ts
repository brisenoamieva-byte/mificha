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
  winTitle: "Qué gana tu torneo",
  winPoints: [
    "Diferenciador: torneo con ficha MiFicha y stats verificadas por categoría.",
    "Menos ruido post-jornada: el padre consulta su link, no tu celular.",
    "Calendario y resultados en mificha.mx/explorar — visibilidad para la marca de tu torneo.",
    "Credibilidad: nadie infla goles; el acta la registra el organizador, no la escuela rival.",
    "Menos disputas de goleadores y tarjetas entre directores.",
    "Retención: academias contentas vuelven a inscribirse la próxima edición.",
  ],
  askTitle: "Qué necesitamos de ti (operación mínima)",
  askPoints: [
    "Calendario de jornadas (rivales, fecha, sede, categoría) — lo cargamos juntos una vez por temporada.",
    "Marcador y acta oficial tras cada jornada (lo que ya anotas en mesa de control).",
    "Promoción a academias inscritas: «Activa plantel en MiFicha» — nosotros damos el guión y el link.",
    "Logo y nombre del torneo en la temporada MiFicha (co-branding en la red escolar).",
  ],
  governanceTitle: "Quién hace qué (sin confusiones)",
  governancePoints: [
    "Organizador: calendario, marcador final y acta (goles, asistencias, tarjetas, minutos).",
    "Academia: plantel, consentimiento y contacto del tutor.",
    "MiFicha: cruza acta con plantel, Passport, insignias y avisos al tutor.",
    "MiFicha no cobra inscripciones ni compite con tu negocio del torneo.",
  ],
  pilotTitle: "Piloto en Querétaro",
  pilotSteps: [
    "1 temporada · 1 categoría · 4–8 academias inscritas en MiFicha.",
    "Publicamos jornadas oficiales antes del arranque.",
    "Tras 2 jornadas: padres con link + academias certificadas en directorio.",
    "Caso de éxito para tu próxima convocatoria de inscripciones.",
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
