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
    "Publica las fichas de tus jugadores y abre el detalle completo de terceros en Explorar.",
  includes: [
    "Publicar fichas de hijos o representados (con opt-in)",
    "Fotos, videos, bio y stats de otros jugadores",
    "Contacto cuando el tutor lo publique",
    "Filtros por categoría, posición y ciudad",
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
  const text = `Hola, quiero Explorar Pro en MiFicha: publicar fichas y ver detalle completo en Explorar.`;
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
