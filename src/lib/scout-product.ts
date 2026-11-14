import { GPH_WHATSAPP_E164 } from "@/lib/gph-alliance";

/** Explorar Pro (tutor o representante): publica fichas + detalle completo en Explorar. */
export const SCOUT_PRODUCT = {
  id: "persona",
  title: "Explorar Pro",
  headline: "Tutor o representante · ficha completa",
  priceUsd: 50,
  priceLabel: "$50",
  currency: "USD",
  period: "al año",
  summary:
    "Con tu cuenta de tutor o representante publicas fichas (con consentimiento) y ves fotos, contacto, videos y detalle de otros jugadores en Explorar.",
  includes: [
    "Publicar fichas de hijos o representados (con opt-in a Explorar)",
    "Ficha completa de terceros: fotos, videos, bio y stats",
    "Datos de contacto cuando el tutor o representante los publique",
    "Búsqueda por categoría, posición y ciudad con detalle completo",
  ],
  checkoutPath: "/fut/explorar#pro",
  /** Endpoint de activación / cobro (promo gratis o Mercado Pago). */
  activateApiPath: "/fut/api/pay/persona",
  exploreProLabel: "Explorar Pro",
} as const;

export type ExploreUnlockReason =
  | "anonymous"
  | "scout_sub"
  | "admin"
  | "owner";

export type ExploreAccess = {
  unlocked: boolean;
  reason: ExploreUnlockReason;
  userId: string | null;
  email: string | null;
};

export function scoutWhatsAppCheckoutHref() {
  const text = `Hola, quiero Explorar Pro en MiFicha (${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency} ${SCOUT_PRODUCT.period}): publicar fichas y ver detalle completo en Explorar.`;
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
