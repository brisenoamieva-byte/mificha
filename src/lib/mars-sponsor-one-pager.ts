export const MARS_SPONSOR_BRAND = {
  name: "Mars",
  legalName: "Mars, Incorporated",
  logoPath: "/sponsors/mars-logo.png",
  /** Mars corporate blue (2019 wordmark). */
  accent: "#0000B2",
  accentSoft: "#E8E8FF",
} as const;

export const MARS_SPONSOR_ONE_PAGER = {
  eyebrow: "Propuesta de patrocinio · Uso interno",
  title: "MiFicha presentado por Mars",
  region: "Futbol escolar · Querétaro · México",
  tagline:
    "Plataforma verificada de fichas digitales para academias escolares — alcance a padres, jugadores y directores con datos medibles y activaciones de marca responsables.",
  opportunityTitle: "La oportunidad",
  opportunity:
    "MiFicha conecta academias escolares, padres y talento juvenil en un ecosistema digital con stats verificadas. Mars puede ser el patrocinador fundador que impulsa la red en Querétaro — con visibilidad ante familias activas en deporte y una historia de apoyo al desarrollo juvenil.",
  audienceTitle: "Audiencia",
  audiencePoints: [
    "Padres y tutores (25–50 años) — reciben avisos post-partido por email/WhatsApp con link a ficha del jugador.",
    "Jugadores escolares (6–18 años) — ficha pública con Passport Score, insignias y progreso verificado.",
    "Directores y coordinadores deportivos — operan plantel, captura y visibilidad de su academia en la red.",
    "Scouts y visorías — directorio público /explorar con destacados semanales por categoría.",
  ],
  fitTitle: "Por qué Mars encaja",
  fitPoints: [
    "Marcas de consumo y bienestar buscan conexión auténtica con familias — no solo publicidad, sino presencia en momentos reales (post-partido, logros, temporada).",
    "Futbol escolar organizado = audiencia recurrente cada fin de semana, no un evento puntual.",
    "MiFicha mide aperturas de ficha, avisos enviados y engagement — KPIs claros para patrocinio.",
    "Activaciones posibles sin acceso a datos personales de menores (ver gobernanza).",
  ],
  activationsTitle: "Menú de activación (a definir juntos)",
  activations: [
    {
      tier: "Naming",
      title: "MiFicha presentado por Mars · Querétaro",
      detail:
        "Marca en landing, /explorar, materiales de jornada y comunicados a academias fundadoras.",
    },
    {
      tier: "Premios",
      title: "Jugador destacado Mars · semanal / jornada",
      detail:
        "Reconocimiento co-branded al once destacado y MVP de jornada — premio simbólico o producto (Snickers, M&M's, etc.) según política de marca.",
    },
    {
      tier: "Digital",
      title: "Insignia y preview OG co-branded",
      detail:
        "Insignia especial «Mars MVP» o similar en fichas verificadas · logo discreto en tarjetas OG compartidas en WhatsApp por padres.",
    },
    {
      tier: "Evento",
      title: "Kickoff de temporada escolar",
      detail:
        "Presentación conjunta con 5–8 academias — Mars como aliado del deporte escolar verificado en Querétaro.",
    },
  ],
  metricsTitle: "Métricas que Mars puede reportar",
  metrics: [
    "Academias activas en la red Querétaro",
    "Jugadores con ficha pública y consentimiento",
    "Avisos automáticos enviados a tutores (email/WhatsApp)",
    "Aperturas únicas de ficha pública (engagement parental)",
    "Destacados semanales y compartidos en redes",
  ],
  pilotTitle: "Fase piloto (antes del patrocinio formal)",
  pilotIntro:
    "Recomendamos cerrar 1–3 academias fundadoras con datos reales antes de firmar — así Mars entra con tracción, no con promesas.",
  pilotGoals: [
    "1–3 academias con plantel cargado y captura post-partido",
    "3+ padres abrieron ficha por academia piloto",
    "1 jornada escolar con acta oficial y stats verificadas",
  ],
  governanceTitle: "Datos y menores (importante para Mars)",
  governancePoints: [
    "Mars no recibe datos personales de jugadores menores — solo visibilidad de marca en superficies acordadas.",
    "MiFicha opera bajo LFPDPPP; consentimiento del tutor antes de ficha pública.",
    "Stats verificadas por gobernanza de roles (organizador = acta · academia = minutos).",
    "Activaciones revisables por legal/compliance de Mars antes de publicar.",
  ],
  askTitle: "Qué buscamos de Mars",
  askPoints: [
    "Patrocinio regional Querétaro (naming + premios + activación digital).",
    "Presupuesto o apoyo en especie para premios a destacados semanales.",
    "Ventana para presentar a marketing / CSR / deportes juvenil (vía contacto interno).",
    "Flexibilidad para piloto co-branded de 1 ciclo escolar antes de escalar.",
  ],
  timelineTitle: "Timeline sugerido",
  timeline: [
    { phase: "Mes 1", detail: "Piloto MiFicha con 1–3 academias · métricas base" },
    { phase: "Mes 2", detail: "Acuerdo Mars · materiales co-branded · kickoff" },
    { phase: "Mes 3–6", detail: "Temporada escolar · 8–15 academias · reporte trimestral" },
  ],
  cta: "¿Agendamos 30 min para revisar encaje y siguiente paso interno?",
  contact: {
    name: "Ricardo Briseño",
    role: "Fundador · MiFicha",
    email: "hola@mificha.mx",
    web: "mificha.mx",
  },
  disclaimer:
    "Documento confidencial de trabajo · no vincula a Mars, Incorporated · logos usados solo para propuesta interna.",
} as const;

export function buildMarsSponsorPlainText(options?: {
  contactName?: string;
}) {
  const greeting = options?.contactName?.trim()
    ? `Hola ${options.contactName.trim()},`
    : "Hola,";

  return [
    greeting,
    "",
    "Te comparto una propuesta de patrocinio para Mars en Querétaro — MiFicha presentado por Mars.",
    "",
    "MiFicha es la plataforma de fichas digitales verificadas para futbol escolar: academias cargan plantel, capturan minutos post-partido, y padres reciben el link automáticamente (sin app). Stats comparables, directorio público y destacados semanales.",
    "",
    "Por qué puede interesar a Mars:",
    "· Audiencia recurrente: padres y familias activas en deporte juvenil cada fin de semana",
    "· KPIs medibles: avisos enviados, aperturas de ficha, academias activas",
    "· Activaciones: naming regional, premios a destacados, insignias co-branded, kickoff de temporada",
    "· Gobernanza: Mars no accede a datos personales de menores — solo visibilidad de marca acordada",
    "",
    "Propuesta: piloto con 1–3 academias (métricas reales) → patrocinio co-branded Querétaro → escalar red escolar.",
    "",
    "¿Te late revisarlo 30 min y ver si encaja con alguien de marketing, CSR o deportes juvenil?",
    "",
    "Ricardo · mificha.mx · hola@mificha.mx",
    "",
    "(One-pager visual: mificha.mx/interno/patrocinio-mars — requiere acceso interno)",
  ].join("\n");
}
