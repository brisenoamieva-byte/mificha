import { getAppBaseUrl } from "@/lib/app-url";
import { formatPlayerCategory } from "@/lib/player-category";
import { formatPublicLockedName } from "@/lib/privacy";
import {
  summarizeTutorSeasons,
  tutorSharePath,
  type TutorChild,
  type TutorSeasonStat,
} from "@/lib/tutor-family";

export interface OgTutorSharePayload {
  title: string;
  subtitle: string;
  publicCode: string | null;
  initials: string;
  badge: string;
  position: string | null;
  category: string | null;
  club: string | null;
  city: string | null;
  /** Pie / estatura / stats cortos para la tarjeta de compartir. */
  detailChips: string[];
  /** Ej. "20 PJ · 5 G · 20 A" — null si no hay temporada. */
  statsLine: string | null;
  photoUrl: string | null;
}

const FOOT_LABEL: Record<"left" | "right" | "both", string> = {
  left: "Zurdo",
  right: "Diestro",
  both: "Ambos pies",
};

export function buildTutorShareAbsoluteUrl(tokenOrCode: string) {
  // Siempre www (apex redirige 308; evita links rotos en WhatsApp/OG).
  return `${getAppBaseUrl()}${tutorSharePath(tokenOrCode)}`;
}

export function buildOgTutorSharePayload(
  child: TutorChild,
  seasons: TutorSeasonStat[] = [],
): OgTutorSharePayload {
  const position = child.profile.position?.trim() || null;
  const club =
    child.linked_academy_name?.trim() ||
    child.profile.club?.trim() ||
    null;
  const city = child.profile.city?.trim() || null;
  const categoryRaw = formatPlayerCategory(child.profile.birth_date);
  const category =
    categoryRaw && categoryRaw !== "Sin categoría" ? categoryRaw : null;

  const bits = [position, category, club, city].filter(Boolean) as string[];

  const parts = child.player_name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || "MF").toUpperCase();

  const detailChips: string[] = [];
  if (child.profile.dominant_foot) {
    detailChips.push(FOOT_LABEL[child.profile.dominant_foot]);
  }
  if (child.profile.height_cm && child.profile.height_cm > 0) {
    detailChips.push(`${child.profile.height_cm} cm`);
  }

  const totals = summarizeTutorSeasons(seasons);
  const statsLine =
    totals.matches > 0 || totals.goals > 0 || totals.assists > 0
      ? [
          totals.matches > 0 ? `${totals.matches} PJ` : null,
          totals.goals > 0 ? `${totals.goals} G` : null,
          totals.assists > 0 ? `${totals.assists} A` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return {
    title: formatPublicLockedName(child.player_name) || "Jugador",
    subtitle: bits.length > 0 ? bits.join(" · ") : "Ficha de presentación",
    publicCode: child.public_code || null,
    initials,
    badge: child.linked_academy_name ? "Academia ligada" : "Ficha del jugador",
    position,
    category,
    club,
    city,
    detailChips,
    statsLine,
    photoUrl: null,
  };
}

export function buildOgTutorImageAlt(payload: OgTutorSharePayload) {
  return `${payload.title} · Ficha del jugador · MiFicha`;
}
