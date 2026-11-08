/** Calendario corto de oportunidades reales o por publicar. */

export type OpportunityStatus = "abierta" | "proximamente";

export interface OpportunityItem {
  id: string;
  kind: "visoria" | "torneo" | "evento" | "entrenamiento";
  title: string;
  dateLabel: string;
  place: string;
  detail: string;
  status: OpportunityStatus;
  href: string;
  cta: string;
}

export const OPPORTUNITY_STATUS_LABEL: Record<OpportunityStatus, string> = {
  abierta: "Abierta",
  proximamente: "En desarrollo",
};

export const MIFICH_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "visorias-qro-nov-2026",
    kind: "visoria",
    title: "Visorías GPH / CRACKS · Querétaro",
    dateLabel: "26 y 27 de noviembre 2026",
    place: "San Javier y Casa de la Juventud",
    detail:
      "Chivas y Santos Laguna. Registro sin costo. La ficha del tutor sirve para presentarse.",
    status: "abierta",
    href: "/fut/visorias",
    cta: "Registrarme",
  },
  {
    id: "especializacion-gph",
    kind: "entrenamiento",
    title: "Especialización GPH",
    dateLabel: "Calendario mensual",
    place: "Querétaro",
    detail:
      "Incluida en membresía con límite de 1 ciclo al mes. Extra se cotiza aparte.",
    status: "proximamente",
    href: "/fut/tutor",
    cta: "Entrar al piloto",
  },
  {
    id: "torneos-alto-nivel",
    kind: "torneo",
    title: "Convocatorias a torneos de alto nivel",
    dateLabel: "Avisos a miembros",
    place: "Selección GPH / MiFicha",
    detail:
      "Avisos curados por GPH/MiFicha cuando haya convocatoria publicada.",
    status: "proximamente",
    href: "/fut/tutor",
    cta: "Crear cuenta de tutor",
  },
  {
    id: "eventos-descuento",
    kind: "evento",
    title: "Eventos y clínicas con descuento",
    dateLabel: "Según calendario GPH",
    place: "Querétaro y sedes GPH",
    detail: "Precio de miembro cuando haya cupo publicado.",
    status: "proximamente",
    href: "/fut/tutor",
    cta: "Entrar como tutor",
  },
];
