/** Logo oficial GPH (Group Performance Hub) — evaluación en MiFicha. */
export const GPH_LOGO = "/partners/gph-logo.png";
export const GPH_LOGO_WIDTH = 353;
export const GPH_LOGO_HEIGHT = 80;

export const GPH_BRAND = {
  acronym: "GPH",
  name: "Group Performance Hub",
  orange: "#f54200",
  ink: "#111111",
} as const;

export const GPH_ALLIANCE = {
  eyebrow: "GPH · MiFicha",
  shortLabel: "GPH · MiFicha",
  headline: "Diagnósticos de jugadores, con seguimiento en la misma ficha",
  methodology:
    "Metodología GPH (Group Performance Hub). Escala 1–5, etapa de desarrollo, lectura de entrenador y plan de seguimiento.",
  reportDisclaimer:
    "Este diagnóstico orienta el programa de desarrollo. No representa una promesa de selección, beca, contrato o resultado profesional.",
} as const;

export const GPH_WHATSAPP_DISPLAY = "442 612 1214";
export const GPH_WHATSAPP_E164 = "524426121214";

export function diagnosisWhatsAppHref(playerName?: string) {
  const text = playerName?.trim()
    ? `Hola, quiero contratar una evaluación GPH para ${playerName.trim()}.`
    : "Hola, quiero contratar una evaluación GPH en MiFicha.";
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

/**
 * Calendly / Google Appointment Schedule del coordinador GPH.
 * Prioridad: URL de diagnóstico → URL general GPH → WhatsApp.
 *
 * Ops (coordinador con Google Calendar):
 * 1. Calendly → conectar Google Calendar, event type “Diagnóstico GPH · Querétaro”
 *    (duración, buffers, preguntas: jugador, WhatsApp, folio MP), o
 *    Google Calendar → Appointment schedules → compartir link.
 * 2. Pegar el link público en Vercel / .env.local como
 *    NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL (o NEXT_PUBLIC_GPH_CALENDLY_URL).
 */
export function getDiagnosisBookingConfig() {
  const dedicated = process.env.NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL?.trim() || "";
  const shared = process.env.NEXT_PUBLIC_GPH_CALENDLY_URL?.trim() || "";
  const url = dedicated || shared;
  return {
    ready: Boolean(url),
    url: url || null,
    source: dedicated
      ? ("diagnosis" as const)
      : shared
        ? ("shared" as const)
        : ("whatsapp" as const),
  };
}

export function diagnosisBookingHref(playerName?: string) {
  const { url } = getDiagnosisBookingConfig();
  return url || diagnosisWhatsAppHref(playerName);
}

export function diagnosisBookingIsCalendar() {
  return getDiagnosisBookingConfig().ready;
}

export function diagnosisBookingCtaLabel(fallback = "Coordinar por WhatsApp") {
  return diagnosisBookingIsCalendar() ? "Elegir horario" : fallback;
}

/** Checklist ops para el coordinador (panel interno). */
export const GPH_DIAGNOSIS_BOOKING_OPS_STEPS = [
  "Crear event type “Diagnóstico GPH · Querétaro” en Calendly (o Appointment schedule en Google Calendar).",
  "Conectar el Google Calendar de quien agenda diagnósticos.",
  "Definir duración (60–90 min), buffers y horarios; sede Querétaro.",
  "Preguntas al reservar: nombre del jugador, WhatsApp, folio de pago (opcional).",
  "Publicar el link y configurarlo en Vercel: NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL.",
] as const;

export function trainingWhatsAppHref() {
  const text =
    "Hola, quiero información sobre entrenamientos y especialización GPH en MiFicha.";
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
