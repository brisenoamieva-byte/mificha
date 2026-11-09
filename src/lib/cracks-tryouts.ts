export const CRACKS_TRYOUTS_PATH = "/fut/cracks";

export const CRACKS_TRYOUTS_POSTER =
  "/partners/cracks-tryouts-queretaro-nov-2026.jpg";

export const CRACKS_TRYOUTS_WHATSAPP_DISPLAY = "446 132 2207";
export const CRACKS_TRYOUTS_WHATSAPP_E164 = "524461322207";

export const CRACKS_TRYOUTS = {
  brand: "CRACKS",
  alliance: "GPH",
  title: "CRACKS llega a Querétaro",
  headline: "Try outs durante todo noviembre",
  city: "Querétaro, Qro.",
  venue: "Colegio San Javier, Querétaro",
  hours: "6:30 a 8:00 p. m.",
  monthLabel: "Noviembre 2026",
  playersReached: "650+",
  pitch:
    "CRACKS cuenta con una trayectoria exitosa en torneos de alto nivel y más de 650 jugadores que han tenido oportunidades en procesos de fuerzas básicas de equipos profesionales.",
  mission:
    "En alianza con GPH, buscamos formar equipos competitivos desde los 5 años, con preparación técnica, física y mental, para participar en torneos regionales y nacionales, como la Liga Nacional Juvenil del Sector Amateur.",
  pillars: [
    "Metodología profesional",
    "Competencia real",
    "Visorías y oportunidades",
    "Desarrollo integral",
  ],
  categoriesYoung: [
    { year: "2020", age: "4 años" },
    { year: "2019", age: "5 años" },
    { year: "2018", age: "6 años" },
    { year: "2017", age: "7 años" },
  ],
  categoriesOlder: [
    { label: "Sub-11", years: "2015–2016" },
    { label: "Sub-13", years: "2013–2014" },
    { label: "Sub-15", years: "2011–2012" },
    { label: "Sub-17", years: "2009–2010" },
  ],
} as const;

export function cracksTryoutsPublicUrl(baseUrl?: string) {
  const root = (baseUrl ?? "https://www.mificha.mx").replace(/\/$/, "");
  return `${root}${CRACKS_TRYOUTS_PATH}`;
}

export function cracksTryoutsWhatsAppHref() {
  const text = [
    "Hola, quiero la liga de registro de CRACKS en Querétaro.",
    "",
    "Nombre del jugador:",
    "Año de nacimiento:",
  ].join("\n");
  return `https://wa.me/${CRACKS_TRYOUTS_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export function cracksTryoutsShareHref(baseUrl?: string) {
  const url = cracksTryoutsPublicUrl(baseUrl);
  const text = `⚽ CRACKS llega a Querétaro

Try outs durante todo noviembre
📍 ${CRACKS_TRYOUTS.venue}
🕡 ${CRACKS_TRYOUTS.hours}

Solicita tu liga de registro:
${url}

WhatsApp: ${CRACKS_TRYOUTS_WHATSAPP_DISPLAY}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
