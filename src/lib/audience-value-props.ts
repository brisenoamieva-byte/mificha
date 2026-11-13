import type { LucideIcon } from "lucide-react";
import { Building2, ClipboardList, MessageCircle, Search, Trophy, UserRound } from "lucide-react";

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
    headline: "Ficha, seguimiento y visibilidad ante agentes.",
    reasons: [
      "Llena la ficha de tu hijo: fotos, videos e historia.",
      "Lleva el seguimiento en un solo expediente.",
      "En Explorar te ven agentes y scouts de futbol (con tu opt-in).",
      "Avisos de visorías, torneos y servicios GPH.",
      "Opcional: diagnóstico GPH $2,030 (−30%, incluye 12 meses).",
    ],
    href: "/fut/tutor",
    cta: "Entrar como tutor",
    tone: "accent",
  },
  {
    id: "evaluaciones",
    icon: ClipboardList,
    title: "Evaluaciones GPH",
    headline: "Evaluación GPH, seguimiento en la misma ficha.",
    reasons: [
      "Metodología GPH: técnica, táctica, físico, mental y hábitos.",
      "Ficha visual con etapa y plan de desarrollo.",
      "La familia consulta y da seguimiento en mificha.mx.",
    ],
    href: "/fut/evaluaciones",
    cta: "Contratar evaluación",
    tone: "brand",
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
    href: "/fut/tutor",
    cta: "Crear ficha del jugador",
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
    headline: "Busca gratis; detalle con membresía persona.",
    reasons: [
      "Filtros por categoría, posición y ciudad — gratis.",
      "Solo jugadores con consentimiento de la familia o representante.",
      "Vista básica para todos; ficha completa con membresía ($50 USD/año).",
      "Esa membresía publica fichas y desbloquea fotos, contacto y detalle.",
    ],
    href: "/fut/explorar",
    cta: "Explorar",
    tone: "accent",
  },
];

export function getAudienceById(id: string) {
  return AUDIENCE_VALUE_PROPS.find((item) => item.id === id);
}
