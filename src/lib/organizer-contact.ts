/** Contacto comercial para registro de torneos. */
export const ORGANIZER_CONTACT = {
  email: "hola@mificha.mx",
  phoneDisplay: "442 155 6155",
  phoneE164: "524421556155",
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
