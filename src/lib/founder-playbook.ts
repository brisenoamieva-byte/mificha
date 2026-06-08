export const FOUNDER_WEEK_PLAN = [
  {
    day: "Lunes",
    task: "Confirmar SQL #11–#18 en Supabase · revisar /interno/lanzamiento y ensayar demo 15 min.",
  },
  {
    day: "Martes",
    task: "Pre-configurar academia demo: temporada + 1 jornada publicada antes de la llamada.",
  },
  {
    day: "Miércoles",
    task: "Demo en vivo (15 min): plantel → captura → WhatsApp con preview OG al director.",
  },
  {
    day: "Fin de semana",
    task: "Acompañar captura post-partido real; validar que sube Passport y contador de padres.",
  },
  {
    day: "Lunes siguiente",
    task: "Cierre: 3 padres abrieron ficha + testimonio del director → caso de éxito.",
  },
] as const;

export function buildFounderOutreachMessage(options: {
  contactName: string;
  matchDate: string;
  academyName?: string;
}) {
  const academy = options.academyName?.trim() || "tu academia";

  return [
    `Hola ${options.contactName}, lanzamos MiFicha en Querétaro — ficha digital verificada para escuelas.`,
    "",
    `En 15 min te enseño en vivo: cargas plantel, capturas stats post-partido en ~2 min y el padre recibe un link con Passport Score (sin app).`,
    "",
    `Después del partido del ${options.matchDate} lo probamos con ${academy} — gratis como academia fundadora.`,
    "",
    `¿Martes o jueves 15 min por videollamada? Te mando el link de la ficha de ejemplo por WhatsApp.`,
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
    `Ver progreso completo: ${options.fichaUrl}`,
  ].join("\n");
}

export const FOUNDER_CONVERSION_CRITERIA = [
  "Plantel cargado (Excel o manual)",
  "1 partido capturado con stats",
  "3+ fichas públicas con consentimiento",
  "3+ padres abrieron el link (contador en dashboard)",
  "Perfil de academia completo (opcional)",
] as const;

export const FOUNDER_DEMO_PRECHECK = [
  "SQL #11–#18 aplicado (verify-production-readiness = true)",
  "Temporada MiFicha creada y asignada a la academia demo",
  "Al menos 1 jornada publicada en /interno/jornadas",
  "Jugador demo con foto + consentimiento listo para activar",
  "Tu celular listo para enviar WhatsApp y mostrar preview de link",
  "Pitch en /interno/pitch en modo Presentar (tecla F)",
] as const;

export interface FounderDemoStep {
  minute: string;
  title: string;
  action: string;
  wow?: string;
  href?: string;
}

export const FOUNDER_LIVE_DEMO_SCRIPT: FounderDemoStep[] = [
  {
    minute: "0–2",
    title: "Gancho emocional",
    action:
      "Abre pitch slide «Tu talento existe, pero no se ve». Pregunta: «¿Cuántos padres te escriben el domingo pidiendo stats?»",
    href: "/interno/pitch",
  },
  {
    minute: "2–4",
    title: "Prueba social",
    action:
      "Muestra mificha.mx/explorar o academias verificadas en Home. «Escuelas de Querétaro ya en la red.»",
    wow: "Logos certificados = FOMO inmediato",
    href: "/explorar",
  },
  {
    minute: "4–7",
    title: "Plantel en vivo",
    action:
      "Inicia sesión juntos → /dashboard/plantel → importa 3–5 jugadores reales (Excel o manual). Activa consentimiento en 1 jugador estrella.",
    href: "/dashboard/plantel",
  },
  {
    minute: "7–9",
    title: "Calendario oficial MiFicha",
    action:
      "Abre /dashboard/partidos: «MiFicha ya publicó la jornada — ustedes no programan rival ni fecha, solo capturan.»",
    wow: "Centralización = stats comparables entre colegios",
    href: "/dashboard/partidos",
  },
  {
    minute: "9–12",
    title: "Captura post-partido",
    action:
      "/dashboard/partidos/nuevo → elige jornada → modo convocados → 2 min → Guardar. Señala Passport subiendo.",
    wow: "El número verde en pantalla — «esto es lo que el padre va a ver»",
    href: "/dashboard/partidos/nuevo",
  },
  {
    minute: "12–14",
    title: "WhatsApp al padre",
    action:
      "Pantalla «Partido guardado» → WhatsApp → pega en TU celular primero. Abre el link: ficha + historial + tarjeta preview en WhatsApp.",
    wow: "Preview OG con Passport — efecto wow garantizado",
  },
  {
    minute: "14–15",
    title: "Cierre",
    action:
      "«Esta semana: 3 padres abren la ficha y quedan activos gratis. ¿Empezamos el lunes?» Agenda Sesión B post-partido real.",
  },
];

export const FOUNDER_DEMO_WOW_MOMENTS = [
  {
    title: "Passport sube en vivo",
    detail: "Tras guardar captura, el +N en verde es tangible — no es promesa, es dato.",
  },
  {
    title: "Preview en WhatsApp",
    detail: "El link /j/slug muestra tarjeta con nombre, stats y Passport antes de abrir.",
  },
  {
    title: "Cero app para padres",
    detail: "Abren link → ven progreso partido a partido. El director no da soporte técnico.",
  },
  {
    title: "Red verificada",
    detail: "Explorar + temporada compartida = «su hijo en la misma liga digital que otras escuelas».",
  },
] as const;

export const PRODUCTION_SQL_SCRIPTS = [
  { id: 11, file: "player-guardian-contact.sql", label: "Email del tutor" },
  { id: 12, file: "privacy-rls-hardening.sql", label: "Endurecer privacidad RLS" },
  { id: 13, file: "match-schedule.sql", label: "Calendario público" },
  { id: 14, file: "platform-seasons-rls.sql", label: "Temporadas solo admin" },
  { id: 15, file: "platform-fixtures-rls.sql", label: "Jornadas solo admin" },
  { id: 16, file: "public-ficha-match-history.sql", label: "Historial en ficha pública" },
  { id: 17, file: "platform-seasons-shared.sql", label: "Temporada compartida MiFicha" },
  { id: 18, file: "player-profile-views.sql", label: "Aperturas de ficha pública" },
] as const;

export const PRODUCTION_SQL_ORDER = [11, 13, 14, 15, 16, 17, 18, 12] as const;
