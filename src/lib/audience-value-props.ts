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
      "No reescribes el partido: el acta oficial alimenta cada ficha.",
      "Los padres dejan de pedirte stats por WhatsApp cada domingo.",
      "Tu plantel aparece en el directorio con badge de academia certificada.",
      "Stats comparables con otras escuelas de la red en tu categoría.",
      "Consentimiento parental en un solo flujo — menos papeles sueltos.",
      "Demuestras profesionalismo ante familias que comparan academias.",
    ],
    href: "/signup",
    secondaryHref: "/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Crear cuenta",
    tone: "brand",
  },
  {
    id: "padres",
    icon: MessageCircle,
    title: "Padres y tutores",
    headline: "El partido de tu hijo, explicado con datos reales.",
    reasons: [
      "Recibes el link por WhatsApp o email tras cada jornada.",
      "Stats del acta oficial: goles, minutos e historial de temporada.",
      "Passport Score y progreso partido a partido, sin interpretar mensajes sueltos.",
      "Comparte la ficha con familia cuando quieras.",
      "Sabes cuánto jugó tu hijo y cómo va la temporada, no solo el marcador.",
      "Confianza: los números los registra el torneo, no la escuela rival.",
    ],
    href: "/padres",
    cta: "Abrir ficha",
    tone: "accent",
  },
  {
    id: "jugadores",
    icon: UserRound,
    title: "Jugadores",
    headline: "Tu historial en el torneo, en un solo lugar.",
    reasons: [
      "Ficha con stats verificados del acta, no números inventados.",
      "Insignias y logros cuando destacás en una jornada.",
      "Link compartible para visorías, pruebas o becas escolares.",
      "Passport Score que refleja participación y rendimiento en la temporada.",
      "Historial de goles, tarjetas y minutos que puedes mostrar con orgullo.",
      "Apareces en destacados semanales si brillás en la jornada.",
    ],
    href: "/padres",
    cta: "Ver mi ficha",
    tone: "accent",
  },
  {
    id: "organizador",
    icon: Trophy,
    title: "Organizadores de torneo",
    headline: "Un torneo con stats que las escuelas y padres confían.",
    reasons: [
      "Publicas calendario, marcador y acta como ya lo haces en mesa de control.",
      "MiFicha sincroniza fichas: las academias no te mandan números distintos.",
      "Diferenciador real frente a otros torneos en inscripciones.",
      "Visibilidad de tu torneo en mificha.mx/explorar.",
      "Menos disputas de goleadores y tarjetas post-jornada.",
      "Caso de éxito con stats verificadas para vender la siguiente edición.",
    ],
    href: "/organizadores",
    cta: "Ver propuesta",
    tone: "brand",
  },
  {
    id: "scout",
    icon: Search,
    title: "Visorías y scouts",
    headline: "Talento escolar con stats que vienen del acta.",
    reasons: [
      "Directorio por categoría, posición, ciudad y Passport Score.",
      "Solo fichas con consentimiento parental y academia certificada.",
      "Destacados semanales y rankings por posición.",
      "Datos comparables entre jugadores de distintas escuelas.",
      "Calendario de partidos para planear visitas a jornadas.",
      "Menos scouting a ciegas: filtras antes de ir al campo.",
    ],
    href: "/explorar",
    cta: "Explorar",
    tone: "accent",
  },
];

export function getAudienceById(id: string) {
  return AUDIENCE_VALUE_PROPS.find((item) => item.id === id);
}
