export const DIRECTOR_ONE_PAGER = {
  eyebrow: "Escolar Querétaro · Academias fundadoras",
  title: "MiFicha",
  tagline: "La ficha técnica digital que tu escuela comparte con padres — stats verificados, cero Excel.",
  problemTitle: "El reto de cada director",
  problems: [
    "Padres preguntan «¿cómo va mi hijo?» y no hay una respuesta clara el mismo día.",
    "Stats en WhatsApp o Excel se pierden y no se comparan con otras escuelas.",
    "Capturar después del partido da flojera — nadie lo hace con consistencia.",
  ],
  solutionTitle: "Qué es MiFicha",
  solution:
    "Plataforma verificada para escuelas: tú capturas stats post-partido en ~2 minutos; el padre recibe un link con Passport Score e historial — sin app ni contraseña. MiFicha publica temporada y jornadas escolares; tu staff solo completa stats oficiales.",
  demoTitle: "Demo en vivo · 15 minutos",
  demoIntro:
    "Te enseñamos con tu plantel real. Sin compromiso. Acceso completo gratis como academia fundadora.",
  demoSteps: [
    {
      step: "1",
      title: "Tu plantel",
      detail: "Importamos 3–5 jugadores (Excel o manual) y activamos consentimiento parental.",
    },
    {
      step: "2",
      title: "Captura post-partido",
      detail: "En ~2 min registras convocados, minutos y goles. El Passport Score sube en pantalla.",
    },
    {
      step: "3",
      title: "WhatsApp al padre",
      detail: "Link con preview visual: stats, progreso partido a partido y ficha verificada.",
    },
  ],
  parentTitle: "Qué ve el padre",
  parentPoints: [
    "Abre QR o link del colegio — sin descargar app.",
    "Passport Score + stats de temporada + evolución partido a partido.",
    "Puede reenviar por WhatsApp a familia.",
    "Privacidad y consentimiento LFPDPPP integrados.",
  ],
  founderTitle: "Academia fundadora",
  founderBenefits: [
    "Acceso completo gratis en fase piloto — sin permanencia.",
    "Temporada y calendario escolar publicados por MiFicha.",
    "Stats comparables con otras escuelas de la red en Querétaro.",
    "Acompañamiento en plantel, primera captura y WhatsApp a padres.",
  ],
  pilotTitle: "Meta del piloto (1 semana)",
  pilotGoals: [
    "1 partido capturado con stats reales.",
    "3 fichas públicas con consentimiento.",
    "3 padres abrieron el link de la ficha.",
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
    "· Cargamos tu plantel (Excel o manual)",
    "· Capturas stats post-partido en ~2 min",
    "· El padre recibe link con Passport Score — sin app",
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
