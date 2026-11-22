import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_SEGUNDA_FASE,
} from "@/lib/gph-pachuca-segunda-fase";
import { GPH_FUN, GPH_FUN_PATH } from "@/lib/gph-fun";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";
import { CRACKS_TRYOUTS, CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { MISION_PATH } from "@/lib/mision";

export type HomeAnnouncementTone = "brand" | "gph" | "event" | "pilot";

export interface HomeAnnouncement {
  id: string;
  tone: HomeAnnouncementTone;
  eyebrow: string;
  title: string;
  detail?: string;
  href: string;
  /** ISO date YYYY-MM-DD inclusive; after this the item is hidden. */
  until?: string;
}

/**
 * Carrusel de home: solo noticias / oportunidades vivas.
 * No duplica el buscador ni CTAs de cuenta.
 */
export const HOME_ANNOUNCEMENTS: HomeAnnouncement[] = [
  {
    id: "mision-fundacional-2026",
    tone: "pilot",
    eyebrow: "Misión",
    title: "Etapa fundacional: armamos el catálogo nacional",
    detail: "Tu ficha suma · la red es de quien participa",
    href: MISION_PATH,
    until: "2026-12-31",
  },
  {
    id: "gph-fun-fiestas-2026",
    tone: "event",
    eyebrow: "GPH FUN",
    title: GPH_FUN.headline,
    detail: `${GPH_FUN.city} · promociones de apertura`,
    href: GPH_FUN_PATH,
    until: "2026-12-31",
  },
  {
    id: "gph-pachuca-segunda-fase-nov-2026",
    tone: "gph",
    eyebrow: "Noticia",
    title: "Cuatro jugadores a segunda fase con Pachuca",
    detail: `${GPH_PACHUCA_SEGUNDA_FASE.alliance} · ${GPH_PACHUCA_SEGUNDA_FASE.place}`,
    href: GPH_PACHUCA_PATH,
    until: "2026-12-15",
  },
  {
    id: "visorias-horarios-nov-2026",
    tone: "event",
    eyebrow: "Visorías · horarios",
    title: "Llegó el momento: horarios Chivas y Santos",
    detail: "26–27 nov · blanco completo · llegar 30 min antes",
    href: VISORIA_PUBLIC_PATH,
    until: "2026-11-27",
  },
  {
    id: "visorias-qro-nov-2026",
    tone: "event",
    eyebrow: "Visoría",
    title: VISORIA_EVENT.title,
    detail: `26–27 nov · ${VISORIA_EVENT.organizers}`,
    href: VISORIA_PUBLIC_PATH,
    until: "2026-11-27",
  },
  {
    id: "cracks-tryouts-nov-2026",
    tone: "gph",
    eyebrow: "Convocatoria",
    title: CRACKS_TRYOUTS.title,
    detail: `${CRACKS_TRYOUTS.headline} · ${CRACKS_TRYOUTS.city}`,
    href: CRACKS_TRYOUTS_PATH,
    until: "2026-11-30",
  },
];

function isActive(item: HomeAnnouncement, now = new Date()) {
  if (!item.until) return true;
  const end = new Date(`${item.until}T23:59:59`);
  return Number.isFinite(end.getTime()) && now.getTime() <= end.getTime();
}

export function getActiveHomeAnnouncements(now = new Date()) {
  return HOME_ANNOUNCEMENTS.filter((item) => isActive(item, now));
}
