import type { LucideIcon } from "lucide-react";
import { ClipboardList, Sparkles, Users } from "lucide-react";
import { academyMembershipPublicCopy } from "@/lib/academy-membership";
import { BRAND_INSTAGRAM_HANDLE, BRAND_INSTAGRAM_URL } from "@/lib/brand";
import { MISION_PATH } from "@/lib/mision";
import { VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

const academyCopy = academyMembershipPublicCopy();

export interface NavLink {
  href: string;
  label: string;
  description?: string;
  /** Si true, se muestra como “próximamente” sin inventar oferta. */
  soon?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  links: NavLink[];
}

/**
 * Menú por intención: Padres / Soluciones / Comunidad + Más.
 * CTA Entrar / Armar ficha viven en el header.
 *
 * Criterio: un destino por intención. Hubs (Productos, Noticias, Eventos,
 * Convocatorias) agrupan lo que antes estaba duplicado como ítems sueltos.
 */
export const MARKETING_NAV: NavSection[] = [
  {
    id: "padres",
    label: "Padres",
    icon: Users,
    links: [
      {
        href: "/fut/entrar?next=/fut/tutor",
        label: "Armar ficha de mi hijo",
        description: "Gratis · ~5 min · con Explorar Pro",
      },
      {
        href: "/fut/tutor",
        label: "Mis fichas",
        description: "Panel del tutor o representante",
      },
      {
        href: "/fut/padres",
        label: "Para familias",
        description: "Cómo funciona la ficha y el seguimiento",
      },
    ],
  },
  {
    id: "soluciones",
    label: "Soluciones",
    icon: Sparkles,
    links: [
      {
        href: "/fut/dashboard",
        label: "Academia",
        description: `Plantel, partidos y MF · ${academyCopy.short}`,
      },
      {
        href: "/fut/organizadores",
        label: "Organizadores de torneo",
        description: "Calendario, acta y datos conectados a fichas",
      },
      {
        href: "/fut/productos",
        label: "Productos GPH",
        description: "Evaluaciones, clase muestra y más",
      },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad",
    icon: ClipboardList,
    links: [
      {
        href: VISORIA_PUBLIC_PATH,
        label: "Visorías Querétaro",
        description: "26–27 nov · Chivas y Santos · registro abierto",
      },
      {
        href: "/fut/noticias",
        label: "Noticias",
        description: "Anuncios y logros de la red",
      },
      {
        href: "/fut/eventos",
        label: "Eventos",
        description: "Clínicas, jornadas y GPH FUN",
      },
      {
        href: "/fut/convocatorias",
        label: "Convocatorias",
        description: "Try outs y oportunidades abiertas",
      },
    ],
  },
];

/**
 * Secundarios (menú “Más”). Sin Entrar (ya está en el header).
 * App / misión / mapa viven aquí — no se repiten en Padres.
 */
export const MARKETING_SECONDARY_LINKS: NavLink[] = [
  {
    href: "/fut/app",
    label: "Descargar app",
    description: "Android e iPhone · pantalla de inicio",
  },
  {
    href: MISION_PATH,
    label: "Qué es MiFicha",
    description: "En qué estamos y cómo sumar tu ficha",
  },
  {
    href: "/fut#como-funciona",
    label: "Cómo funciona",
    description: "Buscar gratis, publicar ficha, membresía",
  },
  {
    href: "/fut/talento",
    label: "Talento por estado",
    description: "Índice y mapa de fichas en México",
  },
  {
    href: BRAND_INSTAGRAM_URL,
    label: `Instagram ${BRAND_INSTAGRAM_HANDLE}`,
    description: "Novedades, visorías y comunidad",
  },
  {
    href: "/fut/aviso-privacidad",
    label: "Privacidad de menores",
    description: "Fichas privadas por defecto · consentimiento del tutor",
  },
  {
    href: "https://wa.me/524421556155?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20patrocinio%20en%20MiFicha.",
    label: "Patrocinio",
    description: "WhatsApp · solicitar información",
  },
];

/** @deprecated Tabla torneo vs MiFicha — ya no en home; conservada por si se reutiliza. */
export const COMPLEMENT_ROWS = [
  {
    official: "Resultados y tabla",
    mificha: "Stats por jugador en cada jornada",
  },
  {
    official: "Calendario del torneo",
    mificha: "Ficha técnica digital e imprimible",
  },
  {
    official: "Comunicados de la liga",
    mificha: "Aviso al tutor tras cada partido",
  },
  {
    official: "Registro federativo",
    mificha: "Historial por temporada y progreso",
  },
] as const;
