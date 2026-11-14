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

/** Calendly GPH · diagnóstico (override con NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL). */
export const GPH_DIAGNOSIS_CALENDLY_DEFAULT =
  "https://calendly.com/gkperformancehub/diagnostico-gph";

/** Calendly GPH · clase muestra / entrenamiento (override con NEXT_PUBLIC_GPH_CALENDLY_URL). */
export const GPH_TRAINING_CALENDLY_DEFAULT =
  "https://calendly.com/gkperformancehub/clase-muestra-gratuita";

/**
 * Qué es la clase muestra (copy corto, una sola fuente).
 * No es el diagnóstico: es una sesión práctica de especialización para conocer a GPH.
 */
export const GPH_SAMPLE_CLASS = {
  title: "Clase muestra",
  badge: "Gratis",
  summary:
    "Es una sesión práctica gratuita de especialización con el equipo GPH en Querétaro: el jugador entrena con su metodología y la familia conoce el estilo de trabajo, sin evaluación formal ni informe. Si después quieren medir etapa y objetivos, eso es el diagnóstico de pago.",
  ctaHint: "Elige un horario libre en el calendario.",
} as const;

/**
 * Calendly del coordinador GPH.
 * Prioridad: env diagnóstico → default diagnóstico → env entrenamiento → WhatsApp.
 */
export function getDiagnosisBookingConfig() {
  const dedicated = process.env.NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL?.trim() || "";
  const shared = process.env.NEXT_PUBLIC_GPH_CALENDLY_URL?.trim() || "";
  const url = dedicated || GPH_DIAGNOSIS_CALENDLY_DEFAULT || shared;
  return {
    ready: Boolean(url),
    url: url || null,
    source: dedicated || GPH_DIAGNOSIS_CALENDLY_DEFAULT
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
  "Diagnóstico: https://calendly.com/gkperformancehub/diagnostico-gph (ya cableado).",
  "Clase muestra: https://calendly.com/gkperformancehub/clase-muestra-gratuita (ya cableado).",
  "Confirmar que el Google Calendar de Gustavo esté ligado a ambos event types.",
  "Revisar duración, buffers, sede Querétaro y preguntas (jugador, WhatsApp, folio MP).",
  "Opcional en Vercel: NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL / NEXT_PUBLIC_GPH_CALENDLY_URL para override.",
] as const;

export function trainingWhatsAppHref() {
  const text =
    "Hola, quiero información sobre entrenamientos y especialización GPH en MiFicha.";
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

/** Calendly clase muestra / entrenamiento. Env → default → WhatsApp. */
export function getTrainingBookingConfig() {
  const dedicated = process.env.NEXT_PUBLIC_GPH_CALENDLY_URL?.trim() || "";
  const url = dedicated || GPH_TRAINING_CALENDLY_DEFAULT;
  return {
    ready: Boolean(url),
    url: url || null,
  };
}

export function trainingBookingHref() {
  const { url } = getTrainingBookingConfig();
  return url || trainingWhatsAppHref();
}

export function trainingBookingIsCalendar() {
  return getTrainingBookingConfig().ready;
}

export function trainingBookingCtaLabel(fallback = "Pedir por WhatsApp") {
  return trainingBookingIsCalendar() ? "Ver horarios" : fallback;
}
