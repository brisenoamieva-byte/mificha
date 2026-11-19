export const GPH_FUN_PATH = "/fut/gph-fun";

export const GPH_FUN_POSTER = "/partners/gph-fun-fiestas-queretaro.jpg";

export const GPH_FUN_WHATSAPP_DISPLAY = "442 822 1067";
export const GPH_FUN_WHATSAPP_E164 = "524428221067";
export const GPH_FUN_CONTACT_NAME = "Mariana Castillo";

export const GPH_FUN = {
  brand: "GPH FUN",
  alliance: "Group Performance Hub",
  title: "GPH FUN · Fiestas futboleras",
  headline: "¡Convertimos tu fiesta en un mundialito!",
  city: "Querétaro, Qro.",
  eyebrow: "Nueva unidad de negocio",
  pitch:
    "Te compartimos con mucha alegría y emoción nuestra nueva unidad de negocio. Fiestas de cumpleaños con fútbol, juegos y premios — el festejado es la estrella.",
  promo:
    "Pregunta por las promociones de apertura. Será un placer atenderte y formar parte de tu día especial.",
  duration: "3 horas de diversión",
  features: [
    "3 horas de diversión",
    "Juegos y retos futboleros",
    "Penales y competencias",
    "Entrenadores",
    "Premios y medallas",
  ],
  shareTitle: "GPH FUN · Fiestas futboleras en Querétaro",
} as const;

export function gphFunPublicUrl(baseUrl?: string) {
  const root = (baseUrl ?? "https://www.mificha.mx").replace(/\/$/, "");
  return `${root}${GPH_FUN_PATH}`;
}

export function gphFunWhatsAppHref() {
  const text = [
    "Hola, me interesa GPH FUN para una fiesta futbolera.",
    "Quiero preguntar por las promociones de apertura.",
    "",
    "Nombre del festejado:",
    "Fecha aproximada:",
    "Edad / categoría:",
  ].join("\n");
  return `https://wa.me/${GPH_FUN_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export function gphFunShareHref(baseUrl?: string) {
  const url = gphFunPublicUrl(baseUrl);
  const text = `${GPH_FUN.shareTitle}

${GPH_FUN.headline}

${GPH_FUN.promo}

${url}

WhatsApp ${GPH_FUN_CONTACT_NAME}: ${GPH_FUN_WHATSAPP_DISPLAY}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
