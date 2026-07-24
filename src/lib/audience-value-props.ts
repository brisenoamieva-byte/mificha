import type { LucideIcon } from "lucide-react";
import { Building2, MessageCircle, Search, Trophy, UserRound } from "lucide-react";

export interface AudienceValueProp {
  id: string;
  icon: LucideIcon;
  title: string;
  headline: string;
  reasons: string[];
  href: string;
  cta: string;
  tone: "brand" | "accent";
  secondaryHref?: string;
  secondaryLabel?: string;
}

export const AUDIENCE_VALUE_PROPS: AudienceValueProp[] = [
  {
    id: "academia",
    icon: Building2,
    title: "Colegios y academias",
    headline: "Menos operación, más confianza de las familias.",
    reasons: [
      "MiFicha gratis — sin mensualidad para tu escuela.",
      "Stats del torneo en cada ficha — sin reescribir el partido.",
      "Menos mensajes de padres pidiendo números cada domingo.",
      "Directorio con badge de academia certificada.",
    ],
    href: "/fut/signup",
    secondaryHref: "/fut/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Crear cuenta",
    tone: "brand",
  },
  {
    id: "padres",
    icon: MessageCircle,
    title: "Padres y tutores",
    headline: "El partido de tu hijo, con datos claros.",
    reasons: [
      "Link automático tras cada jornada.",
      "Goles, minutos e historial de temporada.",
      "Ficha imprimible con logo de la academia.",
      "Stats publicadas por el torneo — no editables por la escuela.",
    ],
    href: "/fut/padres",
    cta: "Abrir ficha",
    tone: "accent",
  },
  {
    id: "jugadores",
    icon: UserRound,
    title: "Jugadores",
    headline: "Tu historial en el torneo, en un solo lugar.",
    reasons: [
      "Ficha con stats verificadas del torneo.",
      "Evaluación del entrenador y posición en cancha.",
      "Insignias cuando destacás en una jornada.",
      "Link para visorías, pruebas o becas.",
    ],
    href: "/fut/padres",
    cta: "Ver mi ficha",
    tone: "accent",
  },
  {
    id: "organizador",
    icon: Trophy,
    title: "Organizadores de torneo",
    headline: "Stats que escuelas y padres pueden confiar.",
    reasons: [
      "Publicas calendario y acta como hoy.",
      "Cada escuela recibe fichas actualizadas solas — gratis para ellas.",
      "Tu torneo visible en Explorar.",
      "Desde $1,999/categoría o $20/jugador · piloto fundador gratis.",
    ],
    href: "/fut/organizadores",
    cta: "Ver precios",
    tone: "brand",
  },
  {
    id: "scout",
    icon: Search,
    title: "Visorías y scouts",
    headline: "Talento escolar con stats del torneo.",
    reasons: [
      "Directorio por categoría, posición y ciudad.",
      "Solo fichas con consentimiento parental.",
      "Stats comparables entre escuelas.",
      "Destacados semanales por jornada.",
    ],
    href: "/fut/explorar",
    cta: "Explorar",
    tone: "accent",
  },
];

export function getAudienceById(id: string) {
  return AUDIENCE_VALUE_PROPS.find((item) => item.id === id);
}
