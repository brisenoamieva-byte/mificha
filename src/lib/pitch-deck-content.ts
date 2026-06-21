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

/** Presentación · 6 diapositivas · ~5 min */
export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "Futbol escolar · Querétaro",
    title: "MiFicha",
    subtitle: "Ficha digital por jugador. Stats del acta oficial. Aviso al padre.",
    highlight: "mificha.mx",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "Hoy",
    title: "Los stats no llegan a los padres",
    bullets: [
      "Todo queda en WhatsApp o Excel",
      "Cada escuela reporta números distintos",
      "El jugador no tiene historial verificable",
    ],
  },
  {
    id: "como",
    variant: "split",
    kicker: "Cómo funciona",
    title: "Tres pasos",
    bullets: [
      "Academia: plantel y contacto del tutor",
      "Organizador: calendario, marcador y acta",
      "MiFicha: sincroniza cada ficha y avisa al padre",
    ],
    stats: [
      { value: "Acta", label: "Fuente oficial" },
      { value: "Auto", label: "Aviso al tutor" },
      { value: "100", label: "Passport Score" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "escuela",
    variant: "split",
    kicker: "Para tu colegio",
    title: "Menos operación, más confianza",
    subtitle: "Complementa tu torneo o liga. No manejamos inscripciones.",
    bullets: [
      "El acta alimenta cada ficha — no capturas el partido",
      "Padres informados sin que pegues WhatsApp",
      "Directorio y academia certificada",
      "Stats comparables en tu categoría",
    ],
    imageKey: "heroExplorar",
  },
  {
    id: "todos",
    kicker: "Red completa",
    title: "Todos ganan con el mismo acta",
    bullets: [
      "Padres: link automático con stats reales",
      "Jugadores: historial verificable para visorías",
      "Scouts: directorio por categoría y posición",
      "Organizador: torneo con credibilidad",
    ],
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "¿Lo vemos en vivo?",
    bullets: [
      "Demo con tu plantel · 15 min",
      "Primera jornada con acta oficial",
      "Padres reciben link automático",
    ],
    highlight: "Ricardo · mificha.mx · hola@mificha.mx",
    imageKey: "ctaBand",
  },
];
