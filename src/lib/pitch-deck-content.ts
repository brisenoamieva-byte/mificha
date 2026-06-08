import type { MarketingImageKey } from "@/lib/marketing-assets";

export interface PitchSlide {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  speakerNote?: string;
  /** cover = foto a pantalla completa · split = texto + foto · cta = cierre con foto de fondo */
  variant?: "cover" | "default" | "cta" | "split";
  stats?: { value: string; label: string }[];
  imageKey?: MarketingImageKey;
}

export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "Escolar Querétaro · mificha.mx",
    title: "MiFicha",
    subtitle:
      "Ficha técnica verificada para escuelas — stats comparables, avisos automáticos a padres, cero Excel.",
    highlight: "Academias fundadoras · acceso completo gratis",
    speakerNote: "Empieza con una pregunta: «¿Cuántos padres te piden stats el domingo?»",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "El dolor",
    title: "Tu talento existe, pero no se ve",
    bullets: [
      "Stats en WhatsApp o Excel — se pierden, no se comparan entre colegios.",
      "Padres preguntan «¿cómo va mi hijo?» y no hay respuesta clara ni verificada.",
      "Capturar después del partido da flojera → nadie lo hace con consistencia.",
      "La liga publica marcador del equipo, no el progreso individual del jugador.",
    ],
    speakerNote: "Valida con el director: «¿Te pasa esto cada semana?»",
  },
  {
    id: "solucion",
    variant: "split",
    kicker: "La solución",
    title: "Una ficha verificada por jugador",
    subtitle:
      "MiFicha centraliza temporada y jornadas escolares. Tu staff captura convocados y minutos en ~1 min; el padre recibe el link automático — sin app.",
    stats: [
      { value: "~1 min", label: "Convocados + minutos" },
      { value: "0", label: "App para padres" },
      { value: "100", label: "Passport Score" },
    ],
    speakerNote: "No vendas software — vende «respuesta al padre el mismo día, sin que pegues WhatsApp».",
    imageKey: "featurePassport",
  },
  {
    id: "red",
    variant: "split",
    kicker: "Red MiFicha",
    title: "Stats comparables en Querétaro",
    subtitle:
      "Un ciclo escolar compartido, jornadas oficiales publicadas por MiFicha y academias certificadas en el directorio.",
    bullets: [
      "Temporada única MiFicha → mismas fechas, mismas reglas para todos.",
      "Jornadas centralizadas → tú capturas, no inventas rival ni fecha.",
      "Passport y stats comparables entre escuelas de la red.",
      "Badge verificado en explorar → prueba social para padres y visorías.",
    ],
    speakerNote: "FOMO: «Las escuelas que entran primero aparecen como fundadoras certificadas.»",
    imageKey: "heroExplorar",
  },
  {
    id: "gobernanza",
    variant: "split",
    kicker: "Datos creíbles",
    title: "Cada quien registra lo suyo",
    subtitle:
      "Nadie infla marcadores ni goles. Stats comparables porque el origen de cada dato está definido.",
    bullets: [
      "Organizador MiFicha: calendario, marcador y acta oficial (G / A / tarjetas).",
      "Academia: plantel, consentimiento, convocados y minutos.",
      "MiFicha: Passport, insignias, rankings y aviso automático al tutor.",
      "Padres: solo consultan — reciben link post-partido, no capturan.",
    ],
    speakerNote: "«Tu rival no puede ponerse 5 goles en MiFicha.» Eso vende credibilidad al director.",
    imageKey: "featureCalendario",
  },
  {
    id: "flujo",
    variant: "split",
    kicker: "Rutina de sábado",
    title: "Cuatro pasos que se repiten cada semana",
    bullets: [
      "1. Plantel + contacto del tutor (Excel una vez) · consentimiento en 1 clic.",
      "2. Jornada oficial · organizador publica marcador y acta.",
      "3. Academia captura convocados + minutos (~1 min) cuando el acta está lista.",
      "4. MiFicha avisa tutores por email/WhatsApp · Passport e insignias al instante.",
    ],
    speakerNote: "Transición: «Te lo muestro en vivo en 15 minutos con tu plantel real.»",
    imageKey: "featureCaptura",
  },
  {
    id: "wow",
    variant: "split",
    kicker: "Efecto wow",
    title: "Lo que recibe el padre automáticamente",
    subtitle:
      "Link con preview visual · ficha con historial partido a partido · insignias compartibles en WhatsApp.",
    stats: [
      { value: "Auto", label: "Aviso al tutor" },
      { value: "OG", label: "Preview en WhatsApp" },
      { value: "3+", label: "Padres meta piloto" },
    ],
    bullets: [
      "Tras captura → «X tutores avisados» en pantalla del director.",
      "Preview visual antes de abrir — no un URL feo.",
      "Dashboard cuenta visitas únicas → «3 padres ya abrieron la ficha».",
    ],
    speakerNote: "Momento clave: muestra el contador de avisos enviados y el celular del padre con el link.",
    imageKey: "featurePassport",
  },
  {
    id: "academia",
    variant: "split",
    kicker: "Para tu escuela",
    title: "Panel operativo, no otro Excel",
    bullets: [
      "Plantel + import Excel + centro «Avisos a tutores» (link automático).",
      "Captura convocados + minutos (~1 min) — goles y tarjetas vienen del acta oficial.",
      "Rendimiento: gráficas, plantel vs promedio, reportes.",
      "MiFicha publica calendario · tú operas tu plantel, no discutes marcadores.",
    ],
    imageKey: "audienceAcademias",
  },
  {
    id: "padres",
    variant: "split",
    kicker: "Para padres",
    title: "Cero fricción = más engagement",
    bullets: [
      "Reciben link por email o WhatsApp — sin app, sin contraseña.",
      "Passport Score, stats de temporada e historial verificado.",
      "Progreso partido a partido visible al instante.",
      "Reenvían a familia · consentimiento LFPDPPP integrado.",
    ],
    imageKey: "heroPadres",
  },
  {
    id: "passport",
    variant: "split",
    kicker: "Passport Score",
    title: "El número que motiva sin presionar",
    subtitle:
      "Sube con cada partido capturado — perfil completo + participación. El padre lo entiende en un vistazo.",
    stats: [
      { value: "+6", label: "Tras un buen partido" },
      { value: "↑", label: "Evolución visible" },
      { value: "Auto", label: "Aviso post-partido" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "complemento",
    variant: "split",
    kicker: "MiFicha + liga oficial",
    title: "Complementa, no compite",
    subtitle:
      "La liga sigue siendo fuente del marcador oficial. MiFicha registra rendimiento individual con acta verificada.",
    bullets: [
      "Liga: tabla, licencias, resultados oficiales del torneo.",
      "MiFicha: stats individuales, ficha digital, engagement con padres.",
      "Marcador y acta bloqueados por rol — credibilidad ante todas las escuelas.",
    ],
    imageKey: "featureCalendario",
  },
  {
    id: "demo",
    variant: "cta",
    kicker: "Demo en vivo · 15 min",
    title: "Lo hacemos juntos ahora",
    bullets: [
      "Importamos 3 jugadores reales + contacto del tutor.",
      "Publicamos marcador/acta · capturas convocados + minutos (~1 min).",
      "MiFicha avisa al padre — preview + ficha en el celular.",
      "Meta de la semana: 3 padres abren el link.",
    ],
    highlight: "Abrir /interno/lanzamiento → guión paso a paso",
    speakerNote: "Cierra con fecha concreta para el primer partido real.",
    imageKey: "ctaBand",
  },
  {
    id: "lanzamiento",
    variant: "cta",
    kicker: "Hoy",
    title: "Únete como academia fundadora",
    subtitle:
      "Acceso completo gratis mientras armamos la red escolar verificada en Querétaro. Te acompañamos en plantel, captura y avisos a tutores.",
    bullets: [
      "Sin costo en fase piloto · sin permanencia.",
      "Temporada y jornadas publicadas por MiFicha.",
      "Soporte directo para plantel + primer envío automático a padres.",
    ],
    imageKey: "ctaBand",
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "¿Empezamos esta semana?",
    bullets: [
      "Hoy: demo 15 min con tu plantel (si no la hicimos ya).",
      "Este fin de semana: captura real post-partido juntos.",
      "Lunes: 3 padres abrieron ficha → testimonio del director.",
    ],
    highlight: "Ricardo Briseño · mificha.mx · hola@mificha.mx",
    speakerNote: "Pide el sí en la llamada — agenda Sesión B antes de colgar.",
    imageKey: "ogDefault",
  },
];
