import { CRACKS_TRYOUTS, CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_SEGUNDA_FASE,
} from "@/lib/gph-pachuca-segunda-fase";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

/** Solo oportunidades con fecha/cupo real. Lo demás va en ROADMAP_NOTE. */

export type OpportunityStatus = "abierta";

export interface OpportunityItem {
  id: string;
  kind: "visoria" | "alianza" | "torneo" | "evento" | "entrenamiento";
  title: string;
  dateLabel: string;
  place: string;
  detail: string;
  status: OpportunityStatus;
  href: string;
  cta: string;
  /** ISO date YYYY-MM-DD inclusive; after this the item is hidden. */
  until?: string;
}

export const OPPORTUNITY_STATUS_LABEL: Record<OpportunityStatus, string> = {
  abierta: "Abierta",
};

export const MIFICH_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "gph-pachuca-segunda-fase-nov-2026",
    kind: "alianza",
    title: `${GPH_PACHUCA_SEGUNDA_FASE.eyebrow} · Club Pachuca`,
    dateLabel: "Segunda fase en curso",
    place: GPH_PACHUCA_SEGUNDA_FASE.place,
    detail: GPH_PACHUCA_SEGUNDA_FASE.headline,
    status: "abierta",
    href: GPH_PACHUCA_PATH,
    cta: "Leer anuncio",
    until: "2026-12-15",
  },
  {
    id: "visorias-qro-nov-2026",
    kind: "visoria",
    title: `${VISORIA_EVENT.title} · ${VISORIA_EVENT.organizers}`,
    dateLabel: "26 y 27 de noviembre 2026",
    place: "San Javier y Casa de la Juventud",
    detail:
      "Chivas y Santos Laguna. Registro sin costo. La ficha del jugador sirve para presentarse.",
    status: "abierta",
    href: VISORIA_PUBLIC_PATH,
    cta: "Registrarme",
    until: "2026-11-27",
  },
  {
    id: "cracks-tryouts-nov-2026",
    kind: "alianza",
    title: CRACKS_TRYOUTS.title,
    dateLabel: CRACKS_TRYOUTS.headline,
    place: CRACKS_TRYOUTS.venue,
    detail: `${CRACKS_TRYOUTS.hours} · Alianza ${CRACKS_TRYOUTS.alliance}. Solicita tu liga de registro.`,
    status: "abierta",
    href: CRACKS_TRYOUTS_PATH,
    cta: "Ver convocatoria",
    until: "2026-11-30",
  },
];

/** Una línea; no inventa cards “en desarrollo”. */
export const OPPORTUNITY_ROADMAP_NOTE =
  "Más adelante: especialización GPH, convocatorias a torneos y clínicas con precio de miembro.";

function isActive(item: OpportunityItem, now = new Date()) {
  if (!item.until) return true;
  const end = new Date(`${item.until}T23:59:59`);
  return Number.isFinite(end.getTime()) && now.getTime() <= end.getTime();
}

export function getOpenOpportunities(now = new Date()) {
  return MIFICH_OPPORTUNITIES.filter((item) => isActive(item, now));
}
