import type { AccountHome } from "@/lib/account-home";
import { CRACKS_TRYOUTS, CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { GPH_SAMPLE_CLASS, trainingBookingHref } from "@/lib/gph-alliance";
import {
  GPH_PACHUCA_PATH,
  GPH_PACHUCA_SEGUNDA_FASE,
} from "@/lib/gph-pachuca-segunda-fase";
import {
  academyMembershipPublicCopy,
  planesHubSummary,
} from "@/lib/academy-membership";
import { personaMembershipPublicCopy } from "@/lib/persona-membership";
import { SCOUT_PRODUCT } from "@/lib/scout-product";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

const personaCopy = personaMembershipPublicCopy();
const academyCopy = academyMembershipPublicCopy();

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
  summary: planesHubSummary(personaCopy.planesSummary, academyCopy),
  items: [
    {
      id: "persona",
      title: "Tutor o representante",
      detail: SCOUT_PRODUCT.summary,
      meta: personaCopy.meta,
      href: "/fut/tutor",
      cta: personaCopy.cta,
    },
    {
      id: "academia",
      title: "Academia",
      detail: academyCopy.summary,
      meta: academyCopy.meta,
      href: "/fut/signup",
      cta: academyCopy.cta,
    },
  ] satisfies HubItem[],
} as const;

/** Si ya hay sesión, no empujar “Activar gratis / Registrar”: ir al espacio real. */
export function planesHubItemsForAccount(home: AccountHome | null): HubItem[] {
  return PLANES_HUB.items.map((item) => {
    if (item.id === "persona") {
      const hasPersona =
        Boolean(home?.kinds?.length) ||
        home?.kind === "tutor" ||
        home?.kind === "agente";
      if (hasPersona) {
        return {
          ...item,
          href: "/fut/tutor",
          cta: "Ir a mis fichas",
          meta: "Tu cuenta · activa",
          detail:
            "Ya tienes el espacio persona. Continúa con fichas, material y consentimiento.",
        };
      }
      if (home) {
        return {
          ...item,
          href: "/fut/tutor",
          cta: "Abrir mis fichas",
        };
      }
      return item;
    }

    if (item.id === "academia") {
      if (home?.kind === "academia" || home?.kind === "admin") {
        return {
          ...item,
          href: "/fut/dashboard",
          cta: "Ir al panel",
          meta: "Tu academia · activa",
          detail:
            "Ya tienes el canal academia. Sigue en plantel, partidos y códigos MF.",
        };
      }
      return item;
    }

    return { ...item };
  });
}

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
      title: `${GPH_SAMPLE_CLASS.title} GPH`,
      detail: GPH_SAMPLE_CLASS.summary,
      meta: "Gratis · Calendly",
      href: trainingBookingHref(),
      cta: "Ver horarios",
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
