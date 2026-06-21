import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  FileSpreadsheet,
  MessageCircle,
  Scale,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { MarketingImageKey } from "@/lib/marketing-assets";
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

export const HOME_FEATURES = [
  {
    icon: Calendar,
    title: "Calendario y partidos",
    federation: "Calendarios y resultados oficiales",
    mificha:
      "Jornadas oficiales MiFicha: acta del organizador → MiFicha sincroniza stats y avisa tutores.",
    href: "/signup",
    imageKey: "featureCalendario" satisfies MarketingImageKey,
  },
  {
    icon: BarChart3,
    title: "Clasificaciones",
    federation: "Tabla de la competición (puntos del equipo)",
    mificha:
      "Marcador semanal del plantel y progreso individual por categoría.",
    href: "/explorar",
    imageKey: "featurePassport" satisfies MarketingImageKey,
  },
  {
    icon: Scale,
    title: "Comparativa",
    federation: "Comparativa de equipos en liga",
    mificha:
      "Reporte jugador vs promedio del plantel.",
    href: "/signup",
    imageKey: "featureComparativa" satisfies MarketingImageKey,
  },
  {
    icon: FileSpreadsheet,
    title: "Plantel",
    federation: "Altas federativas y licencias",
    mificha:
      "Import Excel, fichas privadas por defecto, link automático para padres.",
    href: "/signup",
    imageKey: "featureCaptura" satisfies MarketingImageKey,
  },
  {
    icon: MessageCircle,
    title: "Avisos automáticos",
    federation: "Portal federado con registro y pagos",
    mificha:
      "MiFicha envía link por email o WhatsApp tras cada partido.",
    href: "/padres",
    imageKey: "featureQr" satisfies MarketingImageKey,
  },
  {
    icon: ShieldCheck,
    title: "Menores protegidos",
    federation: "Mutualidad y reconocimiento médico",
    mificha:
      "Consentimiento parental, fichas privadas y aviso de privacidad LFPDPPP.",
    href: "/aviso-privacidad",
    imageKey: "featureMenores" satisfies MarketingImageKey,
  },
] as const;

export const COMPLEMENT_ROWS = [
  {
    official: "Resultados y tabla de liga",
    mificha: "Stats individuales del acta oficial del torneo",
  },
  {
    official: "Licencia y mutualidad federativa",
    mificha: "Ficha técnica digital para padres y scouts",
  },
  {
    official: "Noticias institucionales",
    mificha: "Aviso automático post-partido y reporte mensual al tutor",
  },
  {
    official: "Carnet del federado",
    mificha: "Passport Score + historial por temporada",
  },
] as const;
