import type { MarketingImageKey } from "@/lib/marketing-assets";

export interface PitchSlide {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  /** cover = foto a pantalla completa · split = texto + foto · cta = cierre con foto de fondo */
  variant?: "cover" | "default" | "cta" | "split";
  stats?: { value: string; label: string }[];
  imageKey?: MarketingImageKey;
}

export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "mificha.mx",
    title: "MiFicha",
    subtitle: "La ficha técnica digital que tu academia comparte con padres y scouts.",
    highlight: "Lanzamiento · academias fundadoras",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "El problema",
    title: "Tu talento existe, pero no se ve",
    bullets: [
      "Stats en Excel o WhatsApp — se pierden, no se comparan.",
      "Padres preguntan «¿cómo va mi hijo?» y no hay respuesta clara.",
      "Scouts piden datos y la academia tarda días en armar algo presentable.",
      "La liga publica resultados del equipo, no el progreso de cada jugador.",
    ],
  },
  {
    id: "solucion",
    variant: "split",
    kicker: "La solución",
    title: "Una ficha verificada por jugador",
    subtitle:
      "MiFicha complementa tu liga oficial. Tú capturas stats post-partido en 60 segundos; el padre consulta la ficha al instante.",
    stats: [
      { value: "60 s", label: "Captura post-partido" },
      { value: "0", label: "App para padres" },
      { value: "100", label: "Passport Score" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "flujo",
    variant: "split",
    kicker: "Cómo funciona",
    title: "Tres pasos, un ciclo que se repite cada semana",
    bullets: [
      "1. Registras plantel (Excel o manual) · fichas privadas por defecto.",
      "2. Publicas calendario: rival, fecha, hora y sede para padres y scouts.",
      "3. Tras cada partido capturas stats · Passport sube · compartes QR o WhatsApp.",
    ],
    imageKey: "featureCaptura",
  },
  {
    id: "academia",
    variant: "split",
    kicker: "Para tu academia",
    title: "Panel operativo, no otro Excel",
    bullets: [
      "Plantel, temporadas y calendario público con hora y sede.",
      "Reporte comparativo: jugador vs promedio del plantel.",
      "Referencia semanal interna por categoría.",
      "QR imprimible para la cancha — onboarding del padre sin fricción.",
      "Enlace opcional al calendario oficial de tu liga (FMF, estatal, municipal).",
    ],
    imageKey: "audienceAcademias",
  },
  {
    id: "padres",
    variant: "split",
    kicker: "Para padres",
    title: "Cero fricción = más engagement",
    bullets: [
      "Consulta calendario con hora y sede en la landing de la academia.",
      "Abre el QR o link que comparte la academia — sin app ni cuenta.",
      "Ve Passport Score, stats de temporada e historial verificado.",
      "Puede reenviar la ficha por WhatsApp a familia o visorías.",
      "Consentimiento parental y privacidad LFPDPPP integrados.",
    ],
    imageKey: "heroPadres",
  },
  {
    id: "scouts",
    variant: "split",
    kicker: "Para visorías",
    title: "Talento visible, stats verificados",
    bullets: [
      "Directorio público en mificha.mx/explorar.",
      "Directorio público y destacados por categoría para visorías.",
      "Ficha con sello «verificada por academia» — no auto-reportado.",
    ],
    imageKey: "heroExplorar",
  },
  {
    id: "passport",
    variant: "split",
    kicker: "Passport Score",
    title: "El número que refleja tu progreso",
    subtitle:
      "Combina perfil completo y participación en temporada. Sube con cada partido registrado — motivación sana, no presión.",
    stats: [
      { value: "+6", label: "Tras un buen partido" },
      { value: "↑↓", label: "Ritmo semanal" },
      { value: "QR", label: "Ficha al padre" },
    ],
    imageKey: "featureQr",
  },
  {
    id: "complemento",
    variant: "split",
    kicker: "MiFicha + liga oficial",
    title: "Complementa, no compite",
    subtitle:
      "Enlazas el calendario de tu competición. MiFicha registra el rendimiento individual; la liga sigue siendo la fuente del marcador oficial.",
    bullets: [
      "Liga: resultados, tabla y licencias federativas.",
      "MiFicha: stats individuales, reportes y ficha digital para padres.",
    ],
    imageKey: "featureCalendario",
  },
  {
    id: "lanzamiento",
    variant: "cta",
    kicker: "Hoy",
    title: "Únete como academia fundadora",
    subtitle:
      "Estamos en fase de lanzamiento. Las academias que entren ahora construyen la red de talento verificado en México.",
    bullets: [
      "Acceso completo mientras armamos la red.",
      "Te acompañamos a cargar plantel y registrar el primer partido.",
      "Padres y scouts usan MiFicha sin fricción desde el día uno.",
    ],
    imageKey: "ctaBand",
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "¿Registramos tu academia esta semana?",
    bullets: [
      "15 min: demo en vivo con tu plantel real.",
      "Primera captura de partido juntos.",
      "QR listo para el siguiente juego.",
    ],
    highlight: "Ricardo Briseño · mificha.mx · hola@mificha.mx",
    imageKey: "ogDefault",
  },
];
