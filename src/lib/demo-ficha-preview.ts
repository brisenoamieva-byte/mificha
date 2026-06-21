import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import type { PlayerPosition } from "@/types/database";

/** Datos de ejemplo para la ficha demo en marketing (no es un jugador real). */
export const DEMO_FICHA_PREVIEW = {
  slug: "santiago-hernandez-demo",
  firstName: "Santiago",
  lastName: "Hernández",
  fullName: "Santiago Hernández",
  position: "forward" as PlayerPosition,
  secondaryPosition: "midfielder" as PlayerPosition,
  positionLabel: "Delantero",
  secondaryLabel: "Mediocampista",
  category: "Sub-15",
  academy: "Academia Gallos",
  city: "Querétaro",
  photoSrc: MARKETING_IMAGES.featurePassport,
  passportScore: 78,
  stats: {
    matches: 12,
    goals: 9,
    assists: 4,
    minutes: 840,
    yellowCards: 1,
    redCards: 0,
  },
  lastMatch: {
    opponent: "Instituto Cervantes",
    score: "2-1",
    detail: "1 gol · 67 min · Jornada 4",
  },
  participation: {
    starts: 8,
    subs: 3,
    noMinutes: 1,
  },
  traits: {
    technical: 8,
    tactical: 7,
    physical: 9,
    attitude: 8,
  },
  verifiedRadar: {
    participation: 8,
    contribution: 7.5,
    minutes: 8.2,
    discipline: 9,
  },
  coachNotes:
    "Buena definición y movimiento sin balón. Presiona bien arriba y genera espacios. Sigue mejorando el pase largo.",
  traitTags: ["Finalizador", "Veloz", "Buen movimiento"],
  badges: ["Verificada por academia", "Activo esta semana"],
  achievements: ["Doblete J3", "Destacado semanal"],
  publicUrl: "mificha.mx/j/santiago-hernandez-demo",
} as const;
