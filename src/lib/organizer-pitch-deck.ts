import type { PitchSlide } from "@/lib/pitch-deck-content";

/**
 * Pitch corto para organizadores de torneo.
 * Ángulo: credibilidad del torneo + menos fricción operativa. No es pitch de academia.
 */
export const ORGANIZER_PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "Para organizadores de torneo · Querétaro",
    title: "MiFicha",
    subtitle:
      "Tu calendario y tu acta se convierten en fichas verificadas. Sin quitarte el control del torneo.",
    highlight: "Registro gratis · mificha.mx/fut/organizadores",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "Tu domingo",
    title: "Compites por precio. Te piden stats. No queda nada.",
    bullets: [
      "Padres y directores te escriben por goles, minutos y tarjetas.",
      "Cada escuela manda un Excel distinto → tú arbitrás la pelea.",
      "Al cerrar el torneo no tienes evidencia para vender la siguiente edición.",
    ],
  },
  {
    id: "porque",
    kicker: "Por qué te conviene",
    title: "Tres motivos, no más",
    bullets: [
      "Diferenciación: tu torneo ofrece ficha oficial, no solo cancha e inscripción.",
      "Menos operación: el acta que ya publicas llega solo a plantel y tutor.",
      "Activo de temporada: historial ligado a tu marca cuando vendas la siguiente.",
    ],
    highlight: "No sustituimos inscripción ni reglamento. Tú sigues siendo la fuente oficial.",
  },
  {
    id: "como",
    variant: "split",
    kicker: "Cómo encaja",
    title: "Tú mandas. MiFicha reparte.",
    bullets: [
      "Tú: calendario, marcador y acta.",
      "Academia: plantel y contacto del tutor (gratis para ellas).",
      "MiFicha: sincroniza fichas y avisa al padre.",
    ],
    stats: [
      { value: "Gratis", label: "Registro del torneo" },
      { value: "1 acta", label: "Fuente por partido" },
      { value: "Auto", label: "Aviso al tutor" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "no-es",
    kicker: "Claridad",
    title: "Qué no es",
    bullets: [
      "No es otra app de inscripción.",
      "No es que las academias capturen el marcador oficial.",
      "No es un costo escondido: el registro del torneo es gratis.",
    ],
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Siguiente paso",
    title: "Cargamos tu primera jornada juntos",
    bullets: [
      "20 min: vemos tu calendario",
      "Activamos academias con un guión listo",
      "Primera acta → fichas y avisos en automático",
    ],
    highlight: "WhatsApp 442 155 6155 · hola@mificha.mx · mificha.mx/fut/organizadores",
    imageKey: "ctaBand",
  },
];
