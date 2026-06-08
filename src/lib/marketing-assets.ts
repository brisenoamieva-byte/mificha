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
  ctaBand: "/marketing/cta-band.png",
  ogDefault: "/marketing/og-default.png",
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;
