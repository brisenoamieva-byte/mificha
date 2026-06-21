import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import type { PlayerPosition } from "@/types/database";

/** Datos de ejemplo para la ficha demo en marketing (no es un jugador real). */
export const DEMO_FICHA_PREVIEW = {
  slug: "santiago-hernandez-demo",
  firstName: "Santiago",
  lastName: "Hernández",
  fullName: "Santiago Hernández",
  birthDate: "2011-04-12",
  age: 15,
  position: "forward" as PlayerPosition,
  secondaryPosition: "midfielder" as PlayerPosition,
  positionLabel: "Delantero",
  secondaryLabel: "Mediocampista",
  dominantFootLabel: "Zurdo",
  jerseyNumber: 9,
  heightCm: 168,
  category: "Sub-15",
  academy: "Academia Gallos",
  academyLogoSrc: MARKETING_IMAGES.demoAcademiaGallosLogo,
  city: "Querétaro",
  seasonLabel: CURRENT_SEASON_LABEL,
  photoSrc: MARKETING_IMAGES.demoPlayerHeadshot,
  stats: {
    matches: 14,
    goals: 11,
    assists: 5,
    minutes: 980,
    yellowCards: 1,
    redCards: 0,
  },
  lastMatch: {
    opponent: "Instituto Cervantes",
    score: "3-1",
    detail: "Jornada 10 · 2 goles · 78 min",
  },
  participation: {
    starts: 10,
    subs: 3,
    noMinutes: 1,
  },
  traits: {
    technical: 8,
    tactical: 7,
    physical: 9,
    attitude: 8,
  },
  coachNotes:
    "Buena definición y movimiento sin balón. Presiona arriba y genera espacios en ataque.",
  /** Insignia real del sistema MiFicha (2+ goles en un partido). */
  achievements: [{ key: "brace", title: "Doblete", emoji: "🔥" }],
  publicUrl: "mificha.mx/#demo-ficha-documento",
} as const;
