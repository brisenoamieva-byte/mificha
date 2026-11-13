import { CRACKS_TRYOUTS, CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { trainingWhatsAppHref } from "@/lib/gph-alliance";
import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_SEGUNDA_FASE,
} from "@/lib/gph-pachuca-segunda-fase";
import { personaMembershipPublicCopy } from "@/lib/persona-membership";
import { SCOUT_PRODUCT } from "@/lib/scout-product";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

const personaCopy = personaMembershipPublicCopy();

export type HubItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  meta?: string;
  cta?: string;
  soon?: boolean;
};

export const PLANES_HUB = {
  title: "Planes",
  summary: personaCopy.planesSummary,
  items: [
    {
      id: "persona",
      title: "Tutor o representante",
      detail: SCOUT_PRODUCT.summary,
      meta: personaCopy.meta,
      href: "/fut/explorar#pro",
      cta: personaCopy.cta,
    },
    {
      id: "academia",
      title: "Academia",
      detail:
        "Plantel, partidos y avisos a tutores sin costo para la escuela. El organizador activa la temporada.",
      meta: "Gratis para la academia",
      href: "/fut/signup",
      cta: "Registrar academia",
    },
  ] satisfies HubItem[],
} as const;

export const PRODUCTOS_HUB = {
  title: "Productos",
  summary: "Servicios GPH que se contratan aparte de los planes de plataforma.",
  items: [
    {
      id: "evaluaciones",
      title: "Evaluaciones GPH",
      detail: "Diagnóstico con metodología GPH y seguimiento en la misma ficha MiFicha.",
      meta: "Incluye 12 meses de plataforma",
      href: "/fut/evaluaciones",
      cta: "Ver evaluación",
    },
    {
      id: "entrenamientos",
      title: "Entrenamientos",
      detail: "Especialización y sesiones GPH. Cupos y fechas por WhatsApp.",
      meta: "Con membresía o cotización",
      href: trainingWhatsAppHref(),
      cta: "Pedir información",
    },
  ] satisfies HubItem[],
} as const;

export const NOTICIAS_HUB = {
  title: "Noticias",
  summary: "Logros y anuncios de la red MiFicha · GPH.",
  items: [
    {
      id: "pachuca",
      title: "Orgullo GPH · Club Pachuca",
      detail: GPH_PACHUCA_SEGUNDA_FASE.headline,
      meta: GPH_PACHUCA_SEGUNDA_FASE.place,
      href: GPH_PACHUCA_PATH,
      cta: "Leer",
    },
  ] satisfies HubItem[],
} as const;

export const VISORIAS_HUB = {
  title: "Visorías",
  summary: "Fechas abiertas para presentarse con clubes.",
  items: [
    {
      id: "qro-nov-2026",
      title: VISORIA_EVENT.title,
      detail: `${VISORIA_EVENT.organizers} · Chivas y Santos Laguna. Registro sin costo.`,
      meta: "26 y 27 de noviembre 2026",
      href: VISORIA_PUBLIC_PATH,
      cta: "Registrarme",
    },
  ] satisfies HubItem[],
} as const;

export const EVENTOS_HUB = {
  title: "Eventos",
  summary: "Clínicas, jornadas y eventos con cupo publicado.",
  items: [] as HubItem[],
  empty:
    "Todavía no hay eventos publicados. Cuando GPH o un aliado abra una fecha, aparecerá aquí.",
} as const;

export const CONVOCATORIAS_HUB = {
  title: "Convocatorias",
  summary: "Procesos abiertos para entrar a un proyecto o plantel.",
  items: [
    {
      id: "cracks-nov-2026",
      title: CRACKS_TRYOUTS.title,
      detail: `${CRACKS_TRYOUTS.headline} · ${CRACKS_TRYOUTS.venue}. Alianza ${CRACKS_TRYOUTS.alliance}.`,
      meta: CRACKS_TRYOUTS.city,
      href: CRACKS_TRYOUTS_PATH,
      cta: "Ver convocatoria",
    },
  ] satisfies HubItem[],
} as const;
