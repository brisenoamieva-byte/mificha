import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";

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

/** Inspirado en portales federativos (calendario, clasificación, comparativa) — adaptado a MiFicha. */
export const MARKETING_NAV: NavSection[] = [
  {
    id: "plataforma",
    label: "Plataforma",
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
        description: "Stats individuales junto a tu liga",
      },
      {
        href: "/padres",
        label: "Ficha del jugador",
        description: "Progreso verificado al instante",
      },
    ],
  },
  {
    id: "accesos",
    label: "Accesos",
    icon: Users,
    links: [
      {
        href: "/signup",
        label: "Soy academia",
        description: "Plantel, partidos y reportes",
      },
      {
        href: "/padres",
        label: "Soy padre",
        description: "Link automático tras cada partido",
      },
      {
        href: "/organizadores",
        label: "Organizo torneos",
        description: "Calendario y acta oficial en MiFicha",
      },
      {
        href: "/explorar",
        label: "Scouts / visorías",
        description: "Directorio y marcador semanal",
      },
    ],
  },
  {
    id: "directorio",
    label: "Directorio",
    icon: Search,
    links: [
      {
        href: "/explorar",
        label: "Explorar talento",
        description: "Jugadores y academias públicas",
      },
      {
        href: "/explorar#rankings",
        label: "Referencia por posición",
        description: "Top por categoría y zona",
      },
      {
        href: "/explorar#ideal-11",
        label: "11 ideal semanal",
        description: "Mejores rendimientos verificados",
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
