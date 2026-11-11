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
        description: "Tutor, academia y seguimiento en un lugar",
      },
      {
        href: "/fut/j/santiago-hernandez-demo",
        label: "Ficha de ejemplo",
        description: "Stats del torneo en una ficha de muestra",
      },
      {
        href: "/fut/tutor",
        label: "Soy tutor",
        description: "Arma la ficha con fotos, videos e historia",
      },
      {
        href: "/fut/padres",
        label: "Padres",
        description: "Cómo funciona MiFicha para la familia",
      },
      {
        href: "/fut/evaluaciones",
        label: "Evaluaciones GPH",
        description: "$2,030 (−30%) · diagnóstico GPH + 12 meses de MiFicha",
      },
      {
        href: "/fut/pachuca",
        label: "Orgullo GPH · Pachuca",
        description: "Cuatro jugadores a segunda fase con Club Pachuca",
      },
      {
        href: "/fut/cracks",
        label: "CRACKS try outs",
        description: "Noviembre · Colegio San Javier · solicita liga de registro",
      },
      {
        href: "/fut/visorias",
        label: "Visorías Querétaro",
        description: "26 y 27 de noviembre 2026 · registro abierto",
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
      {
        href: "/fut/pagar?sku=diagnosis",
        label: "Pagar diagnóstico",
        description: "Ficha del jugador. Diagnóstico GPH $2,030 (−30%, incluye 12 meses).",
      },
      {
        href: "/fut/membresia",
        label: "Membresía anual",
        description: "Qué incluye el seguimiento y las oportunidades",
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
