import { CRACKS_TRYOUTS, CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_SEGUNDA_FASE,
} from "@/lib/gph-pachuca-segunda-fase";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

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
 * Carrusel de la home. Orden = prioridad visual.
 * Para apagar uno: quítalo o pon `until` en el pasado.
 */
export const HOME_ANNOUNCEMENTS: HomeAnnouncement[] = [
  {
    id: "gph-pachuca-segunda-fase-nov-2026",
    tone: "gph",
    eyebrow: GPH_PACHUCA_SEGUNDA_FASE.eyebrow,
    title: "Cuatro jugadores a segunda fase con Pachuca",
    detail: `${GPH_PACHUCA_SEGUNDA_FASE.alliance} · ${GPH_PACHUCA_SEGUNDA_FASE.place}`,
    href: GPH_PACHUCA_PATH,
    until: "2026-12-15",
  },
  {
    id: "visorias-qro-nov-2026",
    tone: "event",
    eyebrow: "Visoría",
    title: VISORIA_EVENT.title,
    detail: `26–27 nov · ${VISORIA_EVENT.organizers} · Chivas y Santos`,
    href: VISORIA_PUBLIC_PATH,
    until: "2026-11-27",
  },
  {
    id: "cracks-tryouts-nov-2026",
    tone: "gph",
    eyebrow: "Alianza",
    title: CRACKS_TRYOUTS.title,
    detail: `${CRACKS_TRYOUTS.headline} · ${CRACKS_TRYOUTS.city}`,
    href: CRACKS_TRYOUTS_PATH,
    until: "2026-11-30",
  },
  {
    id: "gph-diagnosis-promo",
    tone: "gph",
    eyebrow: "Diagnóstico GPH",
    title: "Evaluación de futbol disponible",
    detail: "Diagnóstico GPH + 12 meses de MiFicha",
    href: "/fut/pagar?sku=diagnosis",
  },
  {
    id: "tutor-pilot",
    tone: "pilot",
    eyebrow: "Piloto",
    title: "Ficha del jugador",
    detail: "El tutor arma fotos, videos e historia",
    href: "/fut/tutor",
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
