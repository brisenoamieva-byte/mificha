import { GPH_WHATSAPP_E164 } from "@/lib/gph-alliance";

/** Membresía persona (tutor o representante): publica fichas + Explorar Pro. */
export const SCOUT_PRODUCT = {
  id: "persona",
  title: "Membresía persona",
  headline: "Tutor o representante · ficha completa",
  priceUsd: 50,
  priceLabel: "$50",
  currency: "USD",
  period: "al año",
  summary:
    "Una sola cuenta para tutor o representante: publica fichas con consentimiento y desbloquea fotos, contacto, videos y detalle de terceros (Explorar Pro).",
  includes: [
    "Publicar fichas de hijos o representados (con opt-in a Explorar)",
    "Ficha completa de terceros: fotos, videos, bio y stats",
    "Datos de contacto cuando el tutor o representante los publique",
    "Búsqueda por categoría, posición y ciudad con detalle completo",
  ],
  checkoutPath: "/fut/explorar#pro",
  /** Endpoint de activación / cobro (promo gratis o Mercado Pago). */
  activateApiPath: "/fut/api/pay/persona",
  /** Alias comercial del beneficio de detalle. */
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
  const text = `Hola, quiero la membresía persona MiFicha (${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency} ${SCOUT_PRODUCT.period}): publicar fichas y ver detalle completo en Explorar.`;
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
