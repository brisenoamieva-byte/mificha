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
