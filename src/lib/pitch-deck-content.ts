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

/** Pitch de venta · ~7 slides · 5 min presentación + demo en vivo */
export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "Escolar Querétaro · mificha.mx",
    title: "MiFicha",
    subtitle: "Una ficha por jugador. Padres informados. Academia visible.",
    highlight: "Academias fundadoras · Querétaro",
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
      "Jugadores sin nada que mostrar",
    ],
    speakerNote: "«¿Te pasa cada semana?» Valida con el director antes de seguir.",
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
    speakerNote: "«El padre recibe su ficha el mismo día, sin que pegues WhatsApp.»",
    imageKey: "featurePassport",
  },
  {
    id: "como",
    variant: "split",
    kicker: "Cada sábado",
    title: "Cuatro pasos",
    bullets: [
      "Plantel + tutor",
      "Jornada y acta",
      "Captura de minutos",
      "Aviso al padre",
    ],
    stats: [
      { value: "Auto", label: "Aviso al tutor" },
      { value: "OG", label: "Preview WhatsApp" },
      { value: "3+", label: "Meta piloto" },
    ],
    speakerNote: "«Te lo muestro en vivo ahora.» Muestra el celular del padre con el link.",
    imageKey: "featureCaptura",
  },
  {
    id: "escuela",
    variant: "split",
    kicker: "Para tu escuela",
    title: "Tu plantel en la red",
    bullets: [
      "Jornadas centralizadas",
      "Stats comparables",
      "Directorio /explorar",
      "Academia fundadora",
    ],
    speakerNote: "«Las que entran primero llenan el directorio.» Complementa tu liga, no la reemplaza.",
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
    speakerNote: "«Tu rival no puede ponerse 5 goles.» Tú supervisas, MiFicha opera.",
    imageKey: "featureCalendario",
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "¿Empezamos esta semana?",
    bullets: [
      "Demo en vivo · 15 min",
      "Academia fundadora",
      "3 padres abren ficha",
    ],
    highlight: "Ricardo Briseño · mificha.mx · hola@mificha.mx",
    speakerNote: "Pide el sí. Agenda el primer partido antes de colgar. Guión: /interno/lanzamiento",
    imageKey: "ctaBand",
  },
];
