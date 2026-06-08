import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  FileSpreadsheet,
  QrCode,
  Scale,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";

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
        href: "/#funciones",
        label: "Funciones",
        description: "Calendario, stats, reportes y QR",
      },
      {
        href: "/#complemento",
        label: "MiFicha + liga oficial",
        description: "Complementa, no reemplaza tu federación",
      },
      {
        href: "/padres#ejemplo",
        label: "Ficha del jugador",
        description: "Passport Score y stats verificados",
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
        description: "QR o link sin cuenta",
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
        label: "Rankings por posición",
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
      "Captura post-partido en 60 s: rival, marcador y stats por jugador. Enlace a tu liga oficial.",
    href: "/signup",
    image: MARKETING_IMAGES.featureCalendario,
  },
  {
    icon: BarChart3,
    title: "Clasificaciones",
    federation: "Tabla de la competición (puntos del equipo)",
    mificha:
      "Marcador semanal del plantel, tendencias ↑↓ y Passport Score individual.",
    href: "/explorar",
    image: MARKETING_IMAGES.featurePassport,
  },
  {
    icon: Scale,
    title: "Comparativa",
    federation: "Comparativa de equipos en liga",
    mificha:
      "Reporte jugador vs promedio del plantel — ideal para padres y visorías.",
    href: "/#funciones",
  },
  {
    icon: FileSpreadsheet,
    title: "Plantel",
    federation: "Altas federativas y licencias",
    mificha:
      "Import Excel, fichas privadas por defecto, QR imprimible para padres.",
    href: "/signup",
    image: MARKETING_IMAGES.featureCaptura,
  },
  {
    icon: QrCode,
    title: "Padres sin app",
    federation: "Portal federado con registro y pagos",
    mificha:
      "La academia comparte QR o link. Padres consultan stats sin registro.",
    href: "/padres",
    image: MARKETING_IMAGES.featureQr,
  },
  {
    icon: ShieldCheck,
    title: "Menores protegidos",
    federation: "Mutualidad y reconocimiento médico",
    mificha:
      "Consentimiento parental, fichas privadas y aviso de privacidad LFPDPPP.",
    href: "/aviso-privacidad",
  },
] as const;

export const COMPLEMENT_ROWS = [
  {
    official: "Resultados y tabla de liga",
    mificha: "Stats individuales verificados por tu academia",
  },
  {
    official: "Licencia y mutualidad federativa",
    mificha: "Ficha técnica digital para padres y scouts",
  },
  {
    official: "Noticias institucionales",
    mificha: "Reporte mensual y alertas WhatsApp al padre",
  },
  {
    official: "Carnet del federado",
    mificha: "Passport Score + historial por temporada",
  },
] as const;
