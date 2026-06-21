import type { LucideIcon } from "lucide-react";
import {
  Search,
  Trophy,
  Users,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  links: NavLink[];
}

/** Navegación marketing — un enlace por destino, sin duplicados. */
export const MARKETING_NAV: NavSection[] = [
  {
    id: "producto",
    label: "Producto",
    icon: Trophy,
    links: [
      {
        href: "/#como-funciona",
        label: "Cómo funciona",
        description: "Plantel, acta oficial y aviso al tutor",
      },
      {
        href: "/#complemento",
        label: "MiFicha + liga oficial",
        description: "Stats individuales junto a tu torneo",
      },
      {
        href: "/padres",
        label: "Padres",
        description: "Ficha post-partido por WhatsApp o email",
      },
    ],
  },
  {
    id: "acceso",
    label: "Acceso",
    icon: Users,
    links: [
      {
        href: "/signup",
        label: "Registrar academia",
        description: "Plantel, partidos y reportes",
      },
      {
        href: "/organizadores",
        label: "Organizadores",
        description: "Calendario y acta oficial",
      },
      {
        href: "/explorar",
        label: "Explorar",
        description: "Directorio, rankings e 11 ideal semanal",
      },
    ],
  },
];

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
