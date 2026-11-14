import type { PitchSlide } from "@/lib/pitch-deck-content";

/**
 * Pitch corto para organizadores.
 * Tono: conversación directa, sin eslóganes de startup.
 */
export const ORGANIZER_PITCH_SLIDES: PitchSlide[] = [
  {
    id: "cover",
    variant: "cover",
    kicker: "Organizadores de torneo · Querétaro",
    title: "MiFicha",
    subtitle:
      "Ligas tu calendario y tus actas a fichas de jugadores. El torneo lo sigues llevando tú.",
    highlight: "Sin costo de registro · mificha.mx/fut/organizadores",
    imageKey: "heroHome",
  },
  {
    id: "problema",
    kicker: "Lo que ya te pasa",
    title: "Después del partido te siguen escribiendo",
    bullets: [
      "Padres preguntando goles, minutos o tarjetas.",
      "Cada escuela manda sus números y a veces no coinciden.",
      "Cuando termina la temporada, casi no queda nada concreto para armar la siguiente.",
    ],
  },
  {
    id: "porque",
    kicker: "Para qué sirve",
    title: "Qué ganas al sumar MiFicha",
    bullets: [
      "Tu torneo puede ofrecer ficha por jugador, no solo partido e inscripción.",
      "El acta que ya armás llega a la academia y al tutor, sin que tú reenvíes todo.",
      "Queda historial del torneo para cuando invites escuelas o busques patrocinio.",
    ],
    highlight: "No tocamos tu inscripción ni tu reglamento.",
  },
  {
    id: "como",
    variant: "split",
    kicker: "Reparto de trabajo",
    title: "Cada quien su parte",
    bullets: [
      "Tú publicas calendario, marcador y acta.",
      "La academia carga plantel y el contacto del tutor (sin cuota para ellas).",
      "MiFicha actualiza la ficha y avisa al padre.",
    ],
    stats: [
      { value: "Gratis", label: "Registrar el torneo" },
      { value: "Tu acta", label: "Sigue siendo la oficial" },
      { value: "Aviso", label: "Al tutor después del partido" },
    ],
    imageKey: "featurePassport",
  },
  {
    id: "no-es",
    kicker: "Para que quede claro",
    title: "Esto no es",
    bullets: [
      "Una plataforma para cobrar inscripciones.",
      "Que la academia mande el marcador oficial.",
      "Un cobro sorpresa: registrar el torneo es gratis.",
    ],
  },
  {
    id: "cierre",
    variant: "cta",
    kicker: "Si te late",
    title: "Vemos tu calendario en 20 minutos",
    bullets: [
      "Revisamos cómo cargarlo",
      "Te pasamos un texto listo para las academias",
      "Con la primera acta ya salen fichas y avisos",
    ],
    highlight: "WhatsApp 442 155 6155 · hola@mificha.mx · mificha.mx/fut/organizadores",
    imageKey: "ctaBand",
  },
];
