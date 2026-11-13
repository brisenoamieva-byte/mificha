import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  Megaphone,
  Newspaper,
  Package,
  Sparkles,
} from "lucide-react";
import { CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { trainingWhatsAppHref } from "@/lib/gph-alliance";
import { GPH_PACHUCA_PATH } from "@/lib/gph-pachuca-segunda-fase";
import { personaMembershipPublicCopy } from "@/lib/persona-membership";
import { VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

const personaCopy = personaMembershipPublicCopy();

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
 * IA marketing limpia — sin duplicar el buscador de la home ni mezclar roles.
 * Orden = prioridad en el menú.
 */
export const MARKETING_NAV: NavSection[] = [
  {
    id: "planes",
    label: "Planes",
    icon: Package,
    links: [
      {
        href: "/fut/planes",
        label: "Tutor o representante",
        description: `Fichas + Explorar Pro · ${personaCopy.short}`,
      },
      {
        href: "/fut/planes",
        label: "Academia",
        description: "Plantel y torneo · gratis para la escuela",
      },
    ],
  },
  {
    id: "productos",
    label: "Productos",
    icon: Sparkles,
    links: [
      {
        href: "/fut/evaluaciones",
        label: "Evaluaciones GPH",
        description: "Diagnóstico GPH + 12 meses de MiFicha",
      },
      {
        href: trainingWhatsAppHref(),
        label: "Entrenamientos",
        description: "Especialización GPH · WhatsApp",
      },
    ],
  },
  {
    id: "noticias",
    label: "Noticias",
    icon: Newspaper,
    links: [
      {
        href: GPH_PACHUCA_PATH,
        label: "Orgullo GPH · Pachuca",
        description: "Cuatro jugadores a segunda fase con Club Pachuca",
      },
      {
        href: "/fut/noticias",
        label: "Todas las noticias",
        description: "Anuncios y logros de la red",
      },
    ],
  },
  {
    id: "visorias",
    label: "Visorías",
    icon: ClipboardList,
    links: [
      {
        href: VISORIA_PUBLIC_PATH,
        label: "Visorías Querétaro",
        description: "26–27 nov · Chivas y Santos · registro abierto",
      },
      {
        href: "/fut/visorias",
        label: "Ver visorías",
        description: "Calendario y registro",
      },
    ],
  },
  {
    id: "eventos",
    label: "Eventos",
    icon: CalendarDays,
    links: [
      {
        href: "/fut/eventos",
        label: "Próximos eventos",
        description: "Aún no hay eventos publicados",
        soon: true,
      },
    ],
  },
  {
    id: "convocatorias",
    label: "Convocatorias",
    icon: Megaphone,
    links: [
      {
        href: CRACKS_TRYOUTS_PATH,
        label: "CRACKS · Querétaro",
        description: "Try outs noviembre · solicita liga de registro",
      },
      {
        href: "/fut/convocatorias",
        label: "Todas las convocatorias",
        description: "Oportunidades abiertas para jugadores",
      },
    ],
  },
];

/** Enlaces secundarios (menú “Más”). Sin “Entrar”: ya está el botón del header. */
export const MARKETING_SECONDARY_LINKS: NavLink[] = [
  {
    href: "/fut/#como-funciona",
    label: "Cómo funciona",
    description: "Buscar gratis, publicar ficha, membresía",
  },
  {
    href: "https://wa.me/524421556155?text=Hola%20Ricardo%2C%20quiero%20informaci%C3%B3n%20sobre%20patrocinio%20en%20MiFicha.",
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
