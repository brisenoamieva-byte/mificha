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
    subtitle: "Una ficha por jugador. Padres informados. Academia visible.",
    highlight: "Academias fundadoras · gratis en piloto",
    speakerNote: "«¿Cuántos padres te piden stats el domingo?»",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "El problema",
    title: "El talento existe, pero no se ve",
    bullets: [
      "Stats en WhatsApp o Excel",
      "Padres sin respuesta clara",
      "Nadie captura después del partido",
      "Liga publica equipo, no jugador",
      "Jugadores sin nada que mostrar",
    ],
    speakerNote: "«¿Te pasa cada semana?» «¿Qué mandan tus mejores cuando los buscan?»",
  },
  {
    id: "solucion",
    variant: "split",
    kicker: "La solución",
    title: "Una ficha por jugador",
    subtitle: "Cargamos plantel, capturamos minutos, el padre recibe el link.",
    stats: [
      { value: "~1 min", label: "Por partido" },
      { value: "Auto", label: "Aviso al padre" },
      { value: "100", label: "Passport Score" },
    ],
    speakerNote: "Vende: «el padre recibe su ficha el mismo día, sin que pegues WhatsApp».",
    imageKey: "featurePassport",
  },
  {
    id: "red",
    variant: "split",
    kicker: "Red MiFicha",
    title: "Stats comparables en Querétaro",
    bullets: [
      "Jornadas centralizadas",
      "Stats comparables",
      "Directorio /explorar",
      "Academia fundadora",
    ],
    speakerNote: "«Las que entran primero llenan el directorio.»",
    imageKey: "heroExplorar",
  },
  {
    id: "gobernanza",
    variant: "split",
    kicker: "Datos creíbles",
    title: "Cada quien registra lo suyo",
    subtitle: "Nadie infla goles.",
    bullets: [
      "MiFicha: calendario, acta, minutos",
      "Academia: plantel y consentimiento",
      "Padres: consultan y comparten",
    ],
    speakerNote: "«Tu rival no puede ponerse 5 goles.»",
    imageKey: "featureCalendario",
  },
  {
    id: "flujo",
    variant: "split",
    kicker: "Cada sábado",
    title: "Cuatro pasos",
    bullets: [
      "Plantel + tutor",
      "Jornada y acta",
      "Captura de minutos",
      "Aviso al padre",
    ],
    speakerNote: "«Te lo muestro en vivo en 15 min.»",
    imageKey: "featureCaptura",
  },
  {
    id: "wow",
    variant: "split",
    kicker: "Lo que ve el padre",
    title: "Link automático tras el partido",
    stats: [
      { value: "Auto", label: "Aviso al tutor" },
      { value: "OG", label: "Preview WhatsApp" },
      { value: "3+", label: "Meta piloto" },
    ],
    bullets: [
      "Aviso automático",
      "Preview en WhatsApp",
      "Contador de aperturas",
    ],
    speakerNote: "Muestra el celular del padre con el link.",
    imageKey: "featurePassport",
  },
  {
    id: "visibilidad",
    variant: "split",
    kicker: "Para tu academia",
    title: "Tu plantel en el directorio",
    bullets: [
      "Visible en /explorar",
      "Destacados semanales",
      "Ficha compartible",
      "Entra primero",
    ],
    stats: [
      { value: "/explorar", label: "Directorio" },
      { value: "11", label: "Destacados / semana" },
      { value: "Badge", label: "Fundadora" },
    ],
    speakerNote: "«El chico que destaca no tiene qué mandar. Con MiFicha, sí.»",
    imageKey: "audienceScouts",
  },
  {
    id: "academia",
    variant: "split",
    kicker: "Para tu escuela",
    title: "Tú supervisas, MiFicha opera",
    bullets: [
      "Plantel y tutores",
      "Captura de minutos",
      "Reportes de rendimiento",
      "Landing pública",
    ],
    imageKey: "audienceAcademias",
  },
  {
    id: "padres",
    variant: "split",
    kicker: "Para padres",
    title: "Abren el link y listo",
    bullets: [
      "Link por email o WhatsApp",
      "Passport Score",
      "Historial de temporada",
    ],
    imageKey: "heroPadres",
  },
  {
    id: "passport",
    variant: "split",
    kicker: "Passport Score",
    title: "Un número que el padre entiende",
    stats: [
      { value: "+6", label: "Buen partido" },
      { value: "↑", label: "Evolución" },
      { value: "Auto", label: "Post-partido" },
    ],
    speakerNote: "Sube con cada partido. Resume participación.",
    imageKey: "featurePassport",
  },
  {
    id: "complemento",
    variant: "split",
    kicker: "MiFicha + liga",
    title: "Complementa, no compite",
    bullets: [
      "Liga: tabla y licencias",
      "MiFicha: ficha y avisos",
      "MiFicha: directorio",
    ],
    speakerNote: "La liga sigue igual. MiFicha lleva lo individual y el contacto con padres.",
    imageKey: "featureCalendario",
  },
  {
    id: "demo",
    variant: "cta",
    kicker: "Demo · 15 min",
    title: "Lo hacemos juntos ahora",
    bullets: [
      "3 jugadores + tutor",
      "Marcador y acta",
      "Link al padre",
      "3 padres abren ficha",
    ],
    highlight: "Guión: /interno/lanzamiento",
    speakerNote: "Cierra con fecha del primer partido.",
    imageKey: "ctaBand",
  },
  {
    id: "lanzamiento",
    variant: "cta",
    kicker: "Hoy",
    title: "Únete como academia fundadora",
    bullets: [
      "Gratis en piloto",
      "Jornadas por MiFicha",
      "Operación contigo",
      "Badge en /explorar",
    ],
    imageKey: "ctaBand",
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "¿Empezamos esta semana?",
    bullets: [
      "Demo 15 min",
      "Primer partido juntos",
      "3 padres abrieron ficha",
    ],
    highlight: "Ricardo Briseño · mificha.mx · hola@mificha.mx",
    speakerNote: "Pide el sí y agenda el primer partido.",
    imageKey: "ogDefault",
  },
];
