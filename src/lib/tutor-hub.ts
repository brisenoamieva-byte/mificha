import {
  GPH_TRAINING_CALENDLY_DEFAULT,
  GPH_WHATSAPP_E164,
} from "@/lib/gph-alliance";
import { MEMBERSHIP_OFFER } from "@/lib/membership-offer";

/** Calendly clase muestra / entrenamiento. Env → default GPH → WhatsApp. */
export function gphFreeTrainingBookingHref() {
  const calendly =
    process.env.NEXT_PUBLIC_GPH_CALENDLY_URL?.trim() ||
    GPH_TRAINING_CALENDLY_DEFAULT;
  if (calendly) return calendly;
  const text =
    "Hola, quiero solicitar mi entrenamiento gratuito de especialización con GPH desde MiFicha. ¿Qué espacios hay disponibles?";
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export function gphFreeTrainingBookingIsCalendly() {
  return Boolean(
    process.env.NEXT_PUBLIC_GPH_CALENDLY_URL?.trim() ||
      GPH_TRAINING_CALENDLY_DEFAULT,
  );
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
    title: "Eventos con descuento",
    detail:
      "Clínicas, jornadas y eventos GPH/CRACKS con precio de miembro cuando haya cupo publicado.",
    status: "proximamente",
    href: "#servicios",
    cta: "En el hub",
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
  title: "Lleva MiFicha en el celular",
  detail:
    "Instala MiFicha como app desde el navegador (Android o iPhone). Así entras al hub de tutor sin buscar el link.",
  androidHint: "Chrome → menú ⋮ → Instalar app / Añadir a pantalla de inicio",
  iosHint: "Safari → Compartir → Añadir a pantalla de inicio",
  storeNote:
    "Las apps de Play Store y App Store llegan después; por ahora la instalación web es la vía oficial.",
} as const;
