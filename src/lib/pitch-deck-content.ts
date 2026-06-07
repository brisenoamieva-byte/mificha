export interface PitchSlide {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  variant?: "cover" | "default" | "cta" | "split";
  stats?: { value: string; label: string }[];
}

export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "mificha.mx",
    title: "MiFicha",
    subtitle: "La ficha técnica digital que tu academia comparte con padres y scouts.",
    highlight: "Lanzamiento · academias fundadoras",
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
    kicker: "La solución",
    title: "Una ficha verificada por jugador",
    subtitle:
      "MiFicha complementa tu liga oficial. Tú capturas stats post-partido en 60 segundos; el padre recibe la ficha al instante.",
    stats: [
      { value: "60 s", label: "Captura post-partido" },
      { value: "0", label: "App para padres" },
      { value: "100", label: "Passport Score" },
    ],
  },
  {
    id: "flujo",
    kicker: "Cómo funciona",
    title: "Tres pasos, un ciclo que se repite cada semana",
    bullets: [
      "1. Registras plantel (Excel o manual) · fichas privadas por defecto.",
      "2. Tras cada partido: rival, marcador y stats por jugador (goles, minutos).",
      "3. Passport Score sube · compartes QR o WhatsApp · padre y scout ven la ficha.",
    ],
  },
  {
    id: "academia",
    kicker: "Para tu academia",
    title: "Panel operativo, no otro Excel",
    bullets: [
      "Plantel, temporadas y partidos en un solo lugar.",
      "Reporte comparativo: jugador vs promedio del plantel.",
      "Marcador semanal interno y competencia entre categorías.",
      "QR imprimible para la cancha — onboarding del padre sin fricción.",
      "Enlace opcional al calendario oficial de tu liga (FMF, estatal, municipal).",
    ],
  },
  {
    id: "padres",
    kicker: "Para padres",
    title: "Cero fricción = más engagement",
    bullets: [
      "Escanean QR en la cancha — sin descargar app ni crear cuenta.",
      "Ven Passport Score, stats de temporada e historial verificado.",
      "Comparten la ficha en WhatsApp con familia o visorías.",
      "Consentimiento parental y privacidad LFPDPPP integrados.",
    ],
  },
  {
    id: "scouts",
    kicker: "Para visorías",
    title: "Talento visible, stats verificados",
    bullets: [
      "Directorio público en mificha.mx/explorar.",
      "Rankings por posición, 11 ideal semanal y tendencias ↑↓.",
      "Ficha con sello «verificada por academia» — no auto-reportado.",
    ],
  },
  {
    id: "passport",
    kicker: "Passport Score",
    title: "El número que motiva al jugador",
    subtitle:
      "Combina perfil completo + rendimiento en temporada. Sube con cada partido registrado — el eslabón que activa engagement y viralidad.",
    stats: [
      { value: "+6", label: "Tras un buen partido" },
      { value: "↑↓", label: "Tendencia semanal" },
      { value: "QR", label: "Compartir al padre" },
    ],
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
  },
];
