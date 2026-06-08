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
      "La ficha técnica verificada que tu escuela comparte con padres — stats comparables, cero Excel.",
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
      "MiFicha centraliza temporada y jornadas escolares. Tu staff captura stats en ~2 min post-partido; el padre abre un link — sin app.",
    stats: [
      { value: "~2 min", label: "Captura post-partido" },
      { value: "0", label: "App para padres" },
      { value: "100", label: "Passport Score" },
    ],
    speakerNote: "No vendas software — vende «respuesta al padre el mismo día».",
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
    id: "flujo",
    variant: "split",
    kicker: "Rutina de sábado",
    title: "Tres pasos que se repiten cada semana",
    bullets: [
      "1. Plantel cargado (Excel una vez) · consentimiento parental en 1 clic.",
      "2. Jornada ya publicada por MiFicha · solo eliges partido y capturas.",
      "3. WhatsApp al padre · link con preview · Passport subió hoy.",
    ],
    speakerNote: "Transición: «Te lo muestro en vivo en 15 minutos con tu plantel real.»",
    imageKey: "featureCaptura",
  },
  {
    id: "wow",
    variant: "split",
    kicker: "Efecto wow",
    title: "Lo que el padre ve en WhatsApp",
    subtitle:
      "Tarjeta preview con Passport y stats · ficha con historial partido a partido · QR en la cancha.",
    stats: [
      { value: "OG", label: "Preview en WhatsApp" },
      { value: "+N", label: "Passport en vivo" },
      { value: "3+", label: "Padres meta piloto" },
    ],
    bullets: [
      "Capturas → Passport sube en pantalla delante del director.",
      "Compartes link → preview visual antes de abrir (no un URL feo).",
      "Dashboard cuenta visitas únicas → «3 padres ya abrieron la ficha».",
    ],
    speakerNote: "Momento clave de la demo: envía el link a TU celular y muéstralo.",
    imageKey: "featureQr",
  },
  {
    id: "academia",
    variant: "split",
    kicker: "Para tu escuela",
    title: "Panel operativo, no otro Excel",
    bullets: [
      "Plantel + import Excel + QR imprimibles para la cancha.",
      "Captura por convocados (~2 min en celular post-partido).",
      "Rendimiento: gráficas, plantel vs promedio, reportes.",
      "MiFicha publica calendario · tú solo completas stats oficiales.",
    ],
    imageKey: "audienceAcademias",
  },
  {
    id: "padres",
    variant: "split",
    kicker: "Para padres",
    title: "Cero fricción = más engagement",
    bullets: [
      "Abre QR o link del colegio — sin app, sin contraseña.",
      "Passport Score, stats de temporada e historial verificado.",
      "Progreso partido a partido visible al instante.",
      "Reenvía por WhatsApp a familia · consentimiento LFPDPPP integrado.",
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
      { value: "QR", label: "Compartir al padre" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "complemento",
    variant: "split",
    kicker: "MiFicha + liga oficial",
    title: "Complementa, no compite",
    subtitle:
      "La liga sigue siendo fuente del marcador oficial. MiFicha registra rendimiento individual verificado por la escuela.",
    bullets: [
      "Liga: tabla, licencias, resultados oficiales del torneo.",
      "MiFicha: stats individuales, ficha digital, engagement con padres.",
    ],
    imageKey: "featureCalendario",
  },
  {
    id: "demo",
    variant: "cta",
    kicker: "Demo en vivo · 15 min",
    title: "Lo hacemos juntos ahora",
    bullets: [
      "Importamos 3 jugadores reales de tu plantel.",
      "Capturamos un partido en 2 minutos — ves subir el Passport.",
      "Mandas WhatsApp al padre — preview + ficha en el celular.",
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
      "Acceso completo gratis mientras armamos la red escolar verificada en Querétaro. Te acompañamos en la primera captura.",
    bullets: [
      "Sin costo en fase piloto · sin permanencia.",
      "Temporada y jornadas publicadas por MiFicha.",
      "Soporte directo para plantel + primer WhatsApp a padres.",
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
