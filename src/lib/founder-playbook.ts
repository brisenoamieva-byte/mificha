export const FOUNDER_WEEK_PLAN = [
  {
    day: "Lunes",
    task: "Preparar academia demo: plantel, tutores y una jornada publicada.",
  },
  {
    day: "Martes",
    task: "Ensayar pitch (6 slides) + demo en vivo de punta a punta.",
  },
  {
    day: "Miércoles",
    task: "Primera llamada con director: presentación + demo 15 min.",
  },
  {
    day: "Fin de semana",
    task: "Acompañar jornada real: acta publicada, padres avisados, fichas abiertas.",
  },
  {
    day: "Lunes siguiente",
    task: "Cierre: 3 padres abrieron ficha + testimonio del director.",
  },
] as const;

export function buildFounderOrganizerOutreachMessage(options: {
  contactName: string;
  tournamentName?: string;
}) {
  const tournament = options.tournamentName?.trim() || "tu torneo interescolar";

  return [
    `Hola ${options.contactName},`,
    "",
    `Lanzamos MiFicha en Querétaro: calendario oficial, acta verificada y ficha por jugador.`,
    "",
    `Para ${tournament}:`,
    `· Tú publicas jornadas, marcador y acta (lo que ya anotas en mesa de control).`,
    `· MiFicha sincroniza el acta con cada plantel; el padre recibe link automático.`,
    `· Tu torneo gana visibilidad en mificha.mx.`,
    "",
    `No competimos por inscripciones. Sumamos valor para que escuelas y padres confíen en tu torneo.`,
    "",
    `¿20 min esta semana para ver cómo cargaríamos tu calendario?`,
    "",
    `Ricardo · mificha.mx/fut/organizadores · hola@mificha.mx`,
  ].join("\n");
}

export function buildFounderOutreachMessage(options: {
  contactName: string;
  matchDate: string;
  academyName?: string;
}) {
  const academy = options.academyName?.trim() || "tu academia";

  return [
    `Hola ${options.contactName},`,
    "",
    `Lanzamos MiFicha en Querétaro: ficha digital por jugador con stats del acta oficial del torneo.`,
    "",
    `En 15 min te muestro en vivo: plantel, acta oficial y el link que recibe el padre.`,
    "",
    `Tu academia entra como fundadora en la red de Querétaro.`,
    "",
    `¿Lo probamos antes del partido del ${options.matchDate} con ${academy}?`,
    "",
    `¿Martes o jueves 15 min por videollamada?`,
    "",
    `Ricardo · mificha.mx · hola@mificha.mx`,
  ].join("\n");
}

export function buildFounderDemoWhatsAppSample(options: {
  firstName: string;
  opponent: string;
  passportScore: number;
  fichaUrl: string;
}) {
  return [
    `Actualización de partido · ${options.firstName}`,
    `vs ${options.opponent}`,
    `Passport Score: ${options.passportScore}`,
    `Ver ficha: ${options.fichaUrl}`,
  ].join("\n");
}

export const FOUNDER_CONVERSION_CRITERIA = [
  "Plantel cargado con al menos 3 jugadores",
  "Contacto del tutor en esos jugadores",
  "1 jornada con acta oficial sincronizada",
  "3 padres recibieron aviso y abrieron la ficha",
] as const;

export const FOUNDER_DEMO_PRECHECK = [
  "Academia demo con temporada y 1 jornada publicada",
  "3–5 jugadores con consentimiento y contacto del tutor",
  "Pitch ensayado (6 slides · /fut/interno/pitch · tecla F)",
  "One-pager listo (/fut/interno/demo-one-pager)",
  "Un ensayo completo del guión antes de la llamada",
] as const;

export interface FounderDemoStep {
  minute: string;
  title: string;
  action: string;
  href?: string;
}

export const FOUNDER_LIVE_DEMO_SCRIPT: FounderDemoStep[] = [
  {
    minute: "0–4",
    title: "Presentación",
    action:
      "6 slides: problema → tres pasos → colegio → red completa → cierre. Termina con «¿Lo vemos en vivo?»",
    href: "/fut/interno/pitch",
  },
  {
    minute: "4–7",
    title: "Plantel y tutores",
    action:
      "Muestra 3–5 jugadores con consentimiento y contacto del tutor. La academia solo opera esto.",
    href: "/fut/dashboard/plantel/tutores",
  },
  {
    minute: "7–10",
    title: "Acta oficial",
    action:
      "Publica marcador y acta de la jornada. MiFicha sincroniza stats con cada ficha.",
    href: "/fut/interno/jornadas",
  },
  {
    minute: "10–12",
    title: "Ficha del jugador",
    action:
      "Abre la ficha pública y el aviso al tutor en el celular. Stats vienen del acta, no del coach.",
    href: "/fut/explorar",
  },
  {
    minute: "12–15",
    title: "Cierre",
    action:
      "Propón piloto: primera jornada real + 3 padres con link. Agenda fecha y envía one-pager.",
    href: "/fut/interno/demo-one-pager",
  },
];

export const FOUNDER_POST_MATCH_CHECKLIST = [
  "Organizador publica marcador y acta completa",
  "MiFicha sincroniza fichas de la academia",
  "Confirma que los tutores recibieron aviso",
  "Verifica que al menos 3 padres abrieron la ficha",
  "Pide testimonio al director (30 s por WhatsApp)",
] as const;

export const FOUNDER_GOVERNANCE_SUMMARY = [
  "Organizador: calendario, marcador y acta",
  "Academia: plantel, consentimiento y tutor",
  "MiFicha: sincroniza fichas y avisa al padre",
] as const;
