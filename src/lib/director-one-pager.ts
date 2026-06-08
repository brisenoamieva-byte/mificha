export const DIRECTOR_ONE_PAGER = {
  eyebrow: "Escolar Querétaro · Academias fundadoras",
  title: "MiFicha",
  tagline:
    "Ficha técnica digital verificada — stats comparables, avisos automáticos a padres, cero Excel.",
  problemTitle: "El reto de cada director",
  problems: [
    "Padres preguntan «¿cómo va mi hijo?» y no hay una respuesta clara el mismo día.",
    "Stats en WhatsApp o Excel se pierden y no se comparan con otras escuelas.",
    "Capturar después del partido da flojera — nadie lo hace con consistencia.",
    "Nadie confía en stats si cualquier escuela puede inflar goles o marcadores.",
  ],
  solutionTitle: "Qué es MiFicha",
  solution:
    "Plataforma verificada para escuelas en red: MiFicha publica temporada y jornadas; el organizador registra marcador y acta; tu staff captura convocados y minutos en ~1 min; el padre recibe link con Passport Score automáticamente — sin app ni contraseña.",
  governanceTitle: "Datos creíbles (quién hace qué)",
  governancePoints: [
    "Organizador: calendario, marcador final y acta (goles, asistencias, tarjetas).",
    "Academia: plantel, consentimiento, convocados y minutos jugados.",
    "MiFicha: Passport, insignias, rankings y aviso automático al tutor.",
    "Padres: consultan y comparten — no capturan ni registran stats.",
  ],
  demoTitle: "Demo en vivo · 15 minutos",
  demoIntro:
    "Te enseñamos con tu plantel real. Sin compromiso. Acceso completo gratis como academia fundadora.",
  demoSteps: [
    {
      step: "1",
      title: "Plantel + tutores",
      detail:
        "Importamos 3–5 jugadores (Excel o manual), consentimiento y contacto del tutor para avisos automáticos.",
    },
    {
      step: "2",
      title: "Partido oficial",
      detail:
        "Marcador y acta los publica MiFicha; tu staff captura convocados + minutos (~1 min).",
    },
    {
      step: "3",
      title: "Aviso automático",
      detail:
        "MiFicha envía email o WhatsApp al tutor con link, Passport e insignias — sin pegar mensajes a mano.",
    },
    {
      step: "4",
      title: "Padre abre ficha",
      detail:
        "Preview visual en WhatsApp · historial partido a partido · contador de visitas en tu dashboard.",
    },
  ],
  parentTitle: "Qué ve el padre",
  parentPoints: [
    "Recibe link por email o WhatsApp — sin descargar app.",
    "Passport Score + stats de temporada + evolución partido a partido.",
    "Puede reenviar a familia o compartir insignias.",
    "Privacidad y consentimiento LFPDPPP integrados.",
  ],
  founderTitle: "Academia fundadora",
  founderBenefits: [
    "Acceso completo gratis en fase piloto — sin permanencia.",
    "Temporada y calendario escolar publicados por MiFicha.",
    "Stats comparables con otras escuelas de la red en Querétaro.",
    "Acompañamiento en plantel, captura y avisos automáticos a tutores.",
  ],
  pilotTitle: "Meta del piloto (1 semana)",
  pilotGoals: [
    "1 partido capturado (convocados + minutos) con acta oficial.",
    "3 fichas públicas con consentimiento y contacto del tutor.",
    "3 padres recibieron aviso y abrieron el link de la ficha.",
  ],
  cta: "¿Agendamos 15 min esta semana?",
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
    "Te comparto MiFicha — ficha técnica digital verificada para escuelas en Querétaro.",
    "",
    "En 15 min te muestro en vivo:",
    "· Cargamos plantel + contacto del tutor",
    "· Marcador/acta oficial + captura de convocados y minutos (~1 min)",
    "· MiFicha avisa al padre automáticamente con link y Passport Score",
    "",
    "Datos creíbles: el organizador registra marcador y acta; tu escuela solo opera el plantel.",
    "",
    "Como academia fundadora: acceso completo gratis en el piloto.",
    "",
    ...(match
      ? [`Ideal probarlo antes del partido del ${match}.`, ""]
      : []),
    ...(academy ? [`Para ${academy}.`, ""] : []),
    "¿Te late martes o jueves 15 min?",
    "",
    "Ricardo · mificha.mx · hola@mificha.mx",
  ];

  return lines.join("\n");
}
