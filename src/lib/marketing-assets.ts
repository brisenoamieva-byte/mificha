import type { CSSProperties } from "react";

export interface MarketingImageMeta {
  src: string;
  alt: string;
  /** Desktop / tablet focal point for object-cover */
  objectPosition: string;
  /** Optional tighter crop on small screens */
  objectPositionMobile?: string;
}

export const MARKETING_IMAGES = {
  heroHome: "/marketing/hero-home.png",
  heroPadres: "/marketing/hero-padres.png",
  heroExplorar: "/marketing/hero-explorar.png",
  audienceAcademias: "/marketing/audience-academias.png",
  audiencePadres: "/marketing/audience-padres.png",
  audienceScouts: "/marketing/audience-scouts.png",
  featureCaptura: "/marketing/feature-captura.png",
  featureQr: "/marketing/feature-qr.png",
  featurePassport: "/marketing/feature-passport.png",
  featureCalendario: "/marketing/feature-calendario.png",
  featureComparativa: "/marketing/feature-comparativa.png",
  featureMenores: "/marketing/feature-menores.png",
  ctaBand: "/marketing/cta-band.png",
  ogDefault: "/marketing/og-default.png",
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;

/** Focal points tuned per photo so faces and action stay in frame. */
export const MARKETING_MEDIA: Record<MarketingImageKey, MarketingImageMeta> = {
  heroHome: {
    src: MARKETING_IMAGES.heroHome,
    alt: "Entrenador registrando stats post-partido en cancha escolar",
    objectPosition: "52% 38%",
    objectPositionMobile: "48% 32%",
  },
  heroPadres: {
    src: MARKETING_IMAGES.heroPadres,
    alt: "Padre e hijo en la cancha revisando el celular",
    objectPosition: "42% 45%",
    objectPositionMobile: "38% 40%",
  },
  heroExplorar: {
    src: MARKETING_IMAGES.heroExplorar,
    alt: "Partido escolar visto desde la banda",
    objectPosition: "32% 42%",
    objectPositionMobile: "28% 38%",
  },
  audienceAcademias: {
    src: MARKETING_IMAGES.audienceAcademias,
    alt: "Coordinador deportivo con plantel en cancha escolar",
    objectPosition: "72% 40%",
    objectPositionMobile: "65% 35%",
  },
  audiencePadres: {
    src: MARKETING_IMAGES.audiencePadres,
    alt: "Padre e hija caminando revisando el celular",
    objectPosition: "48% 42%",
  },
  audienceScouts: {
    src: MARKETING_IMAGES.audienceScouts,
    alt: "Equipo descansando en torneo escolar de fin de semana",
    objectPosition: "45% 55%",
    objectPositionMobile: "50% 50%",
  },
  featureCaptura: {
    src: MARKETING_IMAGES.featureCaptura,
    alt: "Captura de stats en el celular después del partido",
    objectPosition: "68% 45%",
    objectPositionMobile: "72% 42%",
  },
  featureQr: {
    src: MARKETING_IMAGES.featureQr,
    alt: "Padre recibiendo link de ficha por WhatsApp en el celular",
    objectPosition: "center center",
  },
  featurePassport: {
    src: MARKETING_IMAGES.featurePassport,
    alt: "Jugador celebrando gol en partido escolar",
    objectPosition: "55% 35%",
  },
  featureCalendario: {
    src: MARKETING_IMAGES.featureCalendario,
    alt: "Día de partido en campus escolar",
    objectPosition: "50% 45%",
  },
  featureComparativa: {
    src: MARKETING_IMAGES.featureComparativa,
    alt: "Coordinador y padre revisando reporte comparativo en tablet",
    objectPosition: "52% 42%",
    objectPositionMobile: "48% 40%",
  },
  featureMenores: {
    src: MARKETING_IMAGES.featureMenores,
    alt: "Padres firmando consentimiento en oficina deportiva del colegio",
    objectPosition: "48% 45%",
    objectPositionMobile: "45% 42%",
  },
  ctaBand: {
    src: MARKETING_IMAGES.ctaBand,
    alt: "",
    objectPosition: "62% 42%",
    objectPositionMobile: "55% 38%",
  },
  ogDefault: {
    src: MARKETING_IMAGES.ogDefault,
    alt: "MiFicha — ficha digital del jugador",
    objectPosition: "center center",
  },
};

export function marketingPhotoStyle(meta: MarketingImageMeta): CSSProperties {
  return {
    ["--photo-pos-mobile" as string]: meta.objectPositionMobile ?? meta.objectPosition,
    ["--photo-pos-desktop" as string]: meta.objectPosition,
  };
}
