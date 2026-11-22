import type { LucideIcon } from "lucide-react";
import { ClipboardList, Sparkles, Users } from "lucide-react";
import { CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { GPH_SAMPLE_CLASS, trainingBookingHref } from "@/lib/gph-alliance";
import { GPH_PACHUCA_PATH } from "@/lib/gph-pachuca-segunda-fase";
import { academyMembershipPublicCopy } from "@/lib/academy-membership";
import { personaMembershipPublicCopy } from "@/lib/persona-membership";
import { MISION_PATH } from "@/lib/mision";
import { VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

const personaCopy = personaMembershipPublicCopy();
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
 * Menú por intención: Padres / Soluciones / Comunidad.
 * CTA principales viven en el header (Entrar / Armar ficha).
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
        description: `Gratis · ~5 min · Explorar Pro · ${personaCopy.short}`,
      },
      {
        href: "/fut/tutor",
        label: "Mis fichas",
        description: "Entrar al panel del tutor o representante",
      },
      {
        href: "/fut/talento",
        label: "Talento por estado",
        description: "Índice agregado de fichas en México",
      },
      {
        href: MISION_PATH,
        label: "Qué es MiFicha",
        description: "En qué estamos y cómo sumar tu ficha",
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
        description: `Panel academia · plantel, partidos y MF · ${academyCopy.short}`,
      },
      {
        href: "/fut/organizadores",
        label: "Organizadores de torneo",
        description: "Calendario, acta y datos conectados a fichas",
      },
      {
        href: "/fut/evaluaciones",
        label: "Evaluaciones GPH",
        description: "Diagnóstico GPH + 12 meses de MiFicha",
      },
      {
        href: trainingBookingHref(),
        label: `${GPH_SAMPLE_CLASS.title} GPH`,
        description: "Gratis · sesión práctica, sin informe de diagnóstico",
      },
      {
        href: "/fut/planes",
        label: "Planes",
        description: "Membresías persona y academia",
      },
      {
        href: "/fut/productos",
        label: "Productos",
        description: "Evaluaciones, entrenamientos y más",
      },
      {
        href: "/fut/captacion",
        label: "Captación multi-estado",
        description: "Plantillas para academias y torneos fuera de QRO",
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
        href: CRACKS_TRYOUTS_PATH,
        label: "CRACKS · Querétaro",
        description: "Try outs noviembre · solicita liga de registro",
      },
      {
        href: GPH_PACHUCA_PATH,
        label: "Orgullo GPH · Pachuca",
        description: "Cuatro jugadores a segunda fase con Club Pachuca",
      },
      {
        href: "/fut/noticias",
        label: "Noticias",
        description: "Anuncios y logros de la red",
      },
      {
        href: "/fut/eventos",
        label: "Eventos",
        description: "Clínicas, jornadas y fiestas publicadas",
      },
      {
        href: "/fut/convocatorias",
        label: "Convocatorias",
        description: "Oportunidades abiertas para jugadores",
      },
      {
        href: "/fut/gph-fun",
        label: "GPH FUN · Fiestas",
        description: "Fiestas futboleras · promociones de apertura",
      },
    ],
  },
];

/** Enlaces secundarios (menú “Más”). Sin “Entrar”: ya está el botón del header. */
export const MARKETING_SECONDARY_LINKS: NavLink[] = [
  {
    href: MISION_PATH,
    label: "Qué es MiFicha",
    description: "Todavía armamos la base · cómo participar",
  },
  {
    href: "/fut/explorar#mapa",
    label: "Mapa de talento",
    description: "De dónde son las fichas en MiFicha",
  },
  {
    href: "/fut#como-funciona",
    label: "Cómo funciona",
    description: "Buscar gratis, publicar ficha, membresía",
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
