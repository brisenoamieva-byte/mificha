export const FOUNDER_WEEK_PLAN = [
  {
    day: "Lunes",
    task: "Ejecutar production-rollout.sql en Supabase · verify-production-readiness = true (#11–#22).",
  },
  {
    day: "Martes",
    task: "Pre-configurar academia demo: temporada + 1 jornada + jugador con tutor listo en /plantel/tutores.",
  },
  {
    day: "Miércoles",
    task: "Demo en vivo (15 min): plantel → marcador/acta → captura minutos → aviso automático al tutor.",
  },
  {
    day: "Fin de semana",
    task: "Acompañar captura post-partido real; validar avisos enviados + contador de padres.",
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
    `En 15 min te enseño en vivo: cargas plantel, capturas convocados y minutos en ~1 min, y el padre recibe el link con Passport Score automáticamente (sin app).`,
    "",
    `Además, tu academia y tus mejores jugadores aparecen en el directorio verificado de Querétaro — ficha compartible para visorías, destacados semanales y badge de academia certificada. No prometemos becas; sí evidencia verificada que refleja en el renombre de tu escuela.`,
    "",
    `Marcador y acta los registra MiFicha como organizador — stats comparables y creíbles entre colegios.`,
    "",
    `Después del partido del ${options.matchDate} lo probamos con ${academy} — gratis como academia fundadora.`,
    "",
    `¿Martes o jueves 15 min por videollamada?`,
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
  "Contacto del tutor en al menos 3 jugadores",
  "1 partido con acta oficial + convocados/minutos capturados",
  "3+ fichas públicas con consentimiento",
  "3+ tutores avisados y padres abrieron el link (contador en dashboard)",
  "Perfil de academia completo (opcional)",
] as const;

export const FOUNDER_DEMO_PRECHECK = [
  "SQL #11–#22 aplicado (supabase/production-rollout.sql + verify-production-readiness)",
  "Temporada MiFicha creada y asignada a la academia demo",
  "Al menos 1 jornada publicada en /interno/jornadas",
  "Jugador demo con foto + consentimiento + tel/email del tutor",
  "Resend o Twilio configurado en Vercel (email o WhatsApp automático)",
  "Pitch en /interno/pitch en modo Presentar (tecla F)",
  "Conoce /interno/gobernanza — marcador/acta vs minutos vs avisos",
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
    title: "Datos creíbles",
    action:
      "Slide «Cada quien registra lo suyo» o /interno/gobernanza. «Nadie infla goles — el organizador pone marcador y acta.»",
    wow: "Credibilidad > promesas de software",
    href: "/interno/gobernanza",
  },
  {
    minute: "4–7",
    title: "Plantel + tutores",
    action:
      "Inicia sesión → /dashboard/plantel → importa 3–5 jugadores. Activa consentimiento y contacto del tutor. Abre /dashboard/plantel/tutores.",
    href: "/dashboard/plantel/tutores",
  },
  {
    minute: "7–9",
    title: "Calendario y acta oficial",
    action:
      "/interno/jornadas: publica jornada, marcador y acta. En /dashboard/partidos la academia solo ve convocados + minutos bloqueados hasta acta.",
    wow: "Marcador = organizador · minutos = academia · comparable entre escuelas",
    href: "/interno/jornadas",
  },
  {
    minute: "9–11",
    title: "Captura post-partido",
    action:
      "/dashboard/partidos/nuevo → convocados + minutos (~1 min) → Guardar. Señala Passport, insignias y ranking semanal.",
    wow: "Recompensas desbloqueadas + «Subió X puestos»",
    href: "/dashboard/partidos/nuevo",
  },
  {
    minute: "11–13",
    title: "Aviso automático al tutor",
    action:
      "Tras guardar: contador «X tutores avisados». Opcional: envío de bienvenida bulk en /plantel/tutores. Muestra preview OG en celular.",
    wow: "El director no pega WhatsApp — MiFicha envía solo",
    href: "/dashboard/plantel/tutores",
  },
  {
    minute: "13–14",
    title: "Visibilidad de la academia",
    action:
      "Slide «Tu plantel en la vitrina verificada» o abre /explorar. «Tus mejores jugadores salen en destacados semanales; la academia aparece certificada. Entra primero como fundadora.»",
    wow: "Evidencia verificada > promesas de becas",
    href: "/explorar",
  },
  {
    minute: "14–15",
    title: "Cierre",
    action:
      "«Esta semana: 3 padres abren la ficha y tu plantel queda visible en la red. ¿Empezamos el lunes?» Agenda Sesión B post-partido real.",
  },
];

export const FOUNDER_DEMO_WOW_MOMENTS = [
  {
    title: "Aviso automático al tutor",
    detail:
      "Tras guardar captura, «X tutores avisados» — email/WhatsApp sin intervención del entrenador.",
  },
  {
    title: "Passport sube en vivo",
    detail: "El +N en verde es tangible — no es promesa, es dato con acta oficial.",
  },
  {
    title: "Preview en WhatsApp",
    detail: "El link /j/slug muestra tarjeta con nombre, stats y Passport antes de abrir.",
  },
  {
    title: "Tarjeta del logro",
    detail:
      "/j/slug/logro/hat_trick genera preview épico de la insignia — ideal para grupos de padres.",
  },
  {
    title: "Gobernanza clara",
    detail:
      "Organizador = marcador/acta · academia = minutos · padres = solo consultan. Stats creíbles en toda la red.",
  },
  {
    title: "Vitrina verificada",
    detail:
      "/explorar muestra academia certificada, destacados semanales y fichas compartibles — renombre sin prometer becas.",
  },
] as const;

export const PRODUCTION_SQL_SCRIPTS = [
  { id: 11, file: "player-guardian-contact.sql", label: "Email del tutor" },
  { id: 12, file: "privacy-rls-hardening.sql", label: "Endurecer privacidad RLS" },
  { id: 13, file: "match-schedule.sql", label: "Calendario público" },
  { id: 14, file: "platform-seasons-rls.sql", label: "Temporadas solo admin" },
  { id: 15, file: "platform-fixtures-rls.sql", label: "Jornadas solo admin" },
  { id: 20, file: "official-match-scoring-rls.sql", label: "Marcador solo organizador" },
  { id: 21, file: "official-match-stats-rls.sql", label: "Acta oficial · stats individuales" },
  { id: 22, file: "guardian-notifications.sql", label: "Avisos automáticos a tutores" },
  { id: 16, file: "public-ficha-match-history.sql", label: "Historial en ficha pública" },
  { id: 17, file: "platform-seasons-shared.sql", label: "Temporada compartida MiFicha" },
  { id: 18, file: "player-profile-views.sql", label: "Aperturas de ficha pública" },
  { id: 19, file: "player-achievements.sql", label: "Insignias y logros verificados" },
] as const;

export const PRODUCTION_SQL_ORDER = [11, 13, 14, 15, 20, 21, 22, 16, 17, 18, 19, 12] as const;

export const MIFICHA_GOVERNANCE_PATH = "/interno/gobernanza" as const;

export const PRODUCTION_ROLLOUT_FILE = "production-rollout.sql" as const;
