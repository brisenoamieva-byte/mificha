import type { LucideIcon } from "lucide-react";
import { Trophy, Users } from "lucide-react";

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
        href: "/fut/#como-funciona",
        label: "Cómo funciona",
        description: "Plantel, acta oficial y aviso al tutor",
      },
      {
        href: "/fut/j/santiago-hernandez-demo",
        label: "Ficha de ejemplo",
        description: "Stats del torneo en una ficha real",
      },
      {
        href: "/fut/padres",
        label: "Padres",
        description: "Ficha post-partido por WhatsApp o email",
      },
      {
        href: "/fut/evaluaciones",
        label: "Evaluaciones GPH",
        description: "Evaluación GPH, seguimiento en la misma ficha",
      },
    ],
  },
  {
    id: "acceso",
    label: "Acceso",
    icon: Users,
    links: [
      {
        href: "/fut/signup",
        label: "Registrar academia",
        description: "Plantel, partidos y reportes",
      },
      {
        href: "/fut/organizadores",
        label: "Organizadores",
        description: "Calendario y acta oficial",
      },
      {
        href: "/fut/explorar",
        label: "Explorar",
        description: "Directorio, rankings e 11 ideal semanal",
      },
    ],
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
