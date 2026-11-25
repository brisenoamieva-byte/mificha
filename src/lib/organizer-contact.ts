import {
  BRAND_WHATSAPP_DISPLAY,
  BRAND_WHATSAPP_E164,
} from "@/lib/brand";

/** Contacto comercial para registro de torneos. */
export const ORGANIZER_CONTACT = {
  email: "hola@mificha.mx",
  phoneDisplay: BRAND_WHATSAPP_DISPLAY,
  phoneE164: BRAND_WHATSAPP_E164,
  whatsappPrefill:
    "Hola, quiero registrar mi torneo en MiFicha (gratis). ¿Me ayudan a cargar el calendario?",
  mailSubject: "Registrar torneo · MiFicha",
} as const;

export function organizerWhatsAppHref(prefill = ORGANIZER_CONTACT.whatsappPrefill) {
  return `https://wa.me/${ORGANIZER_CONTACT.phoneE164}?text=${encodeURIComponent(prefill)}`;
}

export function organizerMailtoHref(
  subject = ORGANIZER_CONTACT.mailSubject,
  body?: string,
) {
  const params = new URLSearchParams({ subject });
  if (body?.trim()) params.set("body", body.trim());
  return `mailto:${ORGANIZER_CONTACT.email}?${params.toString()}`;
}
