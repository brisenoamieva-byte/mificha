import {
  trainingBookingHref,
  trainingBookingIsCalendar,
} from "@/lib/gph-alliance";
import { MEMBERSHIP_OFFER } from "@/lib/membership-offer";

/** @deprecated usar trainingBookingHref — se mantiene para el hub tutor. */
export function gphFreeTrainingBookingHref() {
  return trainingBookingHref();
}

export function gphFreeTrainingBookingIsCalendly() {
  return trainingBookingIsCalendar();
}

export type TutorServiceStatus = "vivo" | "piloto" | "proximamente";

export interface TutorServiceItem {
  id: string;
  title: string;
  detail: string;
  status: TutorServiceStatus;
  href: string;
  cta: string;
  /** Anchor / external */
  external?: boolean;
}

export const TUTOR_SERVICE_STATUS_LABEL: Record<TutorServiceStatus, string> = {
  vivo: "Disponible",
  piloto: "Piloto",
  proximamente: "Próximamente",
};

/** Catálogo de servicios del espacio tutor (la plataforma como base). */
export const TUTOR_SERVICES: TutorServiceItem[] = [
  {
    id: "ficha",
    title: "Ficha del jugador",
    detail:
      "Arma la ficha presentable y actívala en Explorar para que agentes de futbol te encuentren al buscar talento.",
    status: "piloto",
    href: "#ficha",
    cta: "Ir a mi ficha",
  },
  {
    id: "visorias",
    title: "Visorías de Primera División",
    detail:
      MEMBERSHIP_OFFER.benefits.find((b) => b.id === "visorias")?.detail ??
      "Convocatorias abiertas con equipos de alto nivel.",
    status: "vivo",
    href: "#noticias",
    cta: "Ver noticias",
  },
  {
    id: "selectivos",
    title: "Convocatorias y selectivos",
    detail:
      "Avisos curados de torneos y selectivos recomendados por GPH/MiFicha cuando haya convocatoria.",
    status: "proximamente",
    href: "#noticias",
    cta: "Ver calendario",
  },
  {
    id: "eventos",
    title: "Eventos",
    detail:
      "GPH FUN y más: fiestas futboleras, clínicas y jornadas cuando haya cupo publicado.",
    status: "vivo",
    href: "/fut/eventos",
    cta: "Ver eventos",
  },
  {
    id: "gph-gratis",
    title: "Entrenamiento gratuito con GPH",
    detail:
      "Solicita tu ciclo de especialización gratis y revisa espacios disponibles en el calendario.",
    status: "vivo",
    href: "#gph-gratis",
    cta: "Solicitar",
  },
];

export const TUTOR_APP_INSTALL = {
  title: "Descargar app MiFicha",
  detail:
    "App gratis para Android e iPhone: instálala desde el navegador y queda en tu pantalla de inicio.",
  androidHint: "Chrome → menú ⋮ → Instalar app / Añadir a pantalla de inicio",
  iosHint: "Safari → Compartir → Añadir a pantalla de inicio",
  storeNote:
    "Todavía no está en Play Store ni App Store: la vía oficial es instalarla desde /fut/app.",
  href: "/fut/app",
} as const;
