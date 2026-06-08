export const FOUNDER_WEEK_PLAN = [
  {
    day: "Lunes",
    task: "Confirmar SQL #11–#13 en Supabase y revisar /interno/lanzamiento.",
  },
  {
    day: "Martes",
    task: "Elegir 1 academia caliente y enviar mensaje de WhatsApp personal.",
  },
  {
    day: "Miércoles",
    task: "Sesión A (30 min): importar plantel real y programar próximo partido.",
  },
  {
    day: "Fin de semana",
    task: "Estar disponible para capturar stats post-partido juntos.",
  },
  {
    day: "Lunes siguiente",
    task: "Sesión B: mandar QR a 3 padres y pedir testimonio al director.",
  },
] as const;

export function buildFounderOutreachMessage(options: {
  contactName: string;
  matchDate: string;
}) {
  return [
    `Hola ${options.contactName}, estoy lanzando MiFicha — ficha digital con stats verificados para academias.`,
    "",
    `Idea: después del partido del ${options.matchDate}, cada padre recibe un link con stats y Passport Score de su hijo. Sin app, solo QR.`,
    "",
    `¿Te late 30 min esta semana para cargar tu plantel y probarlo gratis antes del partido?`,
  ].join("\n");
}

export const FOUNDER_CONVERSION_CRITERIA = [
  "Perfil de academia completo",
  "Plantel cargado (Excel o manual)",
  "1 partido capturado con stats",
  "3+ fichas públicas con consentimiento",
  "3+ padres abrieron el link",
] as const;

export const PRODUCTION_SQL_SCRIPTS = [
  { id: 11, file: "player-guardian-contact.sql", label: "Email del tutor" },
  { id: 12, file: "privacy-rls-hardening.sql", label: "Endurecer privacidad RLS" },
  { id: 13, file: "match-schedule.sql", label: "Calendario público" },
  { id: 14, file: "platform-seasons-rls.sql", label: "Temporadas solo admin" },
  { id: 15, file: "platform-fixtures-rls.sql", label: "Jornadas solo admin" },
] as const;
