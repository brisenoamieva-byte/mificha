import { formatPlayerCategory } from "@/lib/player-category";
import { formatPublicLockedName } from "@/lib/privacy";
import type { TutorChild } from "@/lib/tutor-family";
import { tutorSharePath } from "@/lib/tutor-family";

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
}

function resolveAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.mificha.mx"
  );
}

export function buildTutorShareAbsoluteUrl(tokenOrCode: string) {
  return `${resolveAppUrl()}${tutorSharePath(tokenOrCode)}`;
}

export function buildOgTutorSharePayload(child: TutorChild): OgTutorSharePayload {
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
  };
}

export function buildOgTutorImageAlt(payload: OgTutorSharePayload) {
  return `${payload.title} · Ficha del jugador · MiFicha`;
}
