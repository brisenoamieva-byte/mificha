import {
  BRAND_WHATSAPP_DISPLAY,
  BRAND_WHATSAPP_E164,
} from "@/lib/brand";
import { LEGAL_ENTITY, LEGAL_ROUTES } from "@/lib/legal";

export const VISORIA_EVENT_ID = "queretaro-nov-2026";

export const VISORIA_POSTER = "/partners/visorias-queretaro-nov-2026.jpg";
/** Flyer con horarios por categoría e indicaciones (26–27 nov). */
export const VISORIA_SCHEDULE_POSTER =
  "/partners/visorias-horarios-nov-2026.jpg";
/** 1200×630 para WhatsApp/OG: recorte desde arriba para no cortar logos ni el título. */
export const VISORIA_OG_IMAGE = "/partners/visorias-queretaro-nov-2026-og.jpg";

export const VISORIA_VIDEOS = [
  {
    src: "/partners/visorias-queretaro-nov-2026-chivas.mp4",
    poster: "/partners/visorias-queretaro-nov-2026-chivas.jpg",
    club: "Club Deportivo Guadalajara",
    label: "Mensaje del visor de Chivas",
  },
  {
    src: "/partners/visorias-queretaro-nov-2026-santos.mp4",
    poster: "/partners/visorias-queretaro-nov-2026-santos.jpg",
    club: "Club Santos Laguna",
    label: "Mensaje del visor de Santos Laguna",
  },
] as const;

export const VISORIA_WHATSAPP_DISPLAY = BRAND_WHATSAPP_DISPLAY;
export const VISORIA_WHATSAPP_E164 = BRAND_WHATSAPP_E164;

export const VISORIA_PUBLIC_PATH = "/fut/visorias";

export const VISORIA_EVENT = {
  id: VISORIA_EVENT_ID,
  edition: "2.ª edición",
  title: "Visorías gratuitas en Querétaro",
  organizers: "GPH / CRACKS",
  clubs: ["Club Deportivo Guadalajara (Chivas)", "Club Santos Laguna"],
  city: "Querétaro, Qro.",
  cost: "Sin costo",
  categories: {
    femenil: { label: "Femenil", years: "2012 a 2008", minYear: 2008, maxYear: 2012 },
    varonil: { label: "Varonil", years: "2018 a 2010", minYear: 2010, maxYear: 2018 },
    /** Fuera de bandas pedidas por visores; se captura el año real de nacimiento. */
    otro: { label: "Otro", years: "fuera de rango · año real", minYear: 2000, maxYear: 2022 },
  },
  days: [
    {
      id: "jueves" as const,
      dateLabel: "Jueves 26 de noviembre",
      hours: "8:45 a.m. a 2:00 p.m.",
      venue: "San Javier, Querétaro",
      audience:
        "Abierta a todo público. Quien se registre puede participar y ser observado por los visores.",
    },
    {
      id: "viernes" as const,
      dateLabel: "Viernes 27 de noviembre",
      hours: "8:45 a.m. a 4:00 p.m.",
      venue: "Casa de la Juventud, Querétaro",
      audience:
        "Solo seleccionados de GPH y jugadores elegidos por los visores el jueves 26.",
    },
  ],
  /** Horarios de participación por categoría (ambos días). */
  scheduleSlots: [
    { time: "8:45 a.m.", label: "Femenil" },
    { time: "9:30 a.m.", label: "Categorías 2018 – 2017" },
    { time: "10:00 a.m.", label: "Categorías 2016 – 2015" },
    { time: "11:00 a.m.", label: "Categorías 2014 – 2013" },
    { time: "12:00 p.m.", label: "Categorías 2012 – 2011 – 2010" },
  ],
  instructions: [
    "Presentarse 30 minutos antes de su horario asignado.",
    "Todos los jugadores deberán asistir vestidos completamente de blanco.",
    "Porteros: podrán utilizar el uniforme y los colores de su preferencia.",
  ],
  familyMessage:
    "Estamos a unos días de vivir una experiencia muy especial. Detrás de cada jugador hay sueños, esfuerzo, disciplina y una familia que nunca deja de apoyarlo.",
} as const;

export type VisoriaCategory = keyof typeof VISORIA_EVENT.categories;
export type VisoriaDay = "jueves" | "viernes";
export type VisoriaPosition = "goalkeeper" | "defender" | "midfielder" | "forward";

export interface VisoriaRegistrationRow {
  id: string;
  event_id: string;
  folio: string;
  source: string;
  player_full_name: string;
  birth_date: string;
  category: VisoriaCategory;
  position: string | null;
  current_club: string | null;
  city: string | null;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string | null;
  attend_thursday: boolean;
  attend_friday: boolean;
  gph_selected: boolean;
  privacy_accepted_at: string;
  image_rights_accepted_at: string;
  clubs_share_accepted_at: string;
  marketing_accepted_at: string | null;
  notes: string | null;
  age_at_registration?: number | null;
  years_training?: number | null;
  nui?: string | null;
  created_at: string;
  /** Código corto MiFicha (MF-XXXX), asignado al listar/backfill. */
  public_code?: string | null;
}

export const VISORIA_POSITIONS: { value: VisoriaPosition; label: string }[] = [
  { value: "goalkeeper", label: "Portero / portera" },
  { value: "defender", label: "Defensa" },
  { value: "midfielder", label: "Mediocampista" },
  { value: "forward", label: "Delantero / delantera" },
];

export function visoriaPublicUrl(baseUrl?: string) {
  const root = (baseUrl ?? "https://www.mificha.mx").replace(/\/$/, "");
  return `${root}${VISORIA_PUBLIC_PATH}`;
}

export function visoriaWhatsAppShareHref(baseUrl?: string) {
  const url = visoriaPublicUrl(baseUrl);
  const slots = VISORIA_EVENT.scheduleSlots
    .map((slot) => `${slot.time} — ${slot.label}`)
    .join("\n");
  const tips = VISORIA_EVENT.instructions.map((line) => `✅ ${line}`).join("\n");
  const text = `⚽🧡 GPH + CRACKS | ¡LLEGÓ EL MOMENTO DE MOSTRAR SU TALENTO!

Queridas familias:

${VISORIA_EVENT.familyMessage}

📅 26 y 27 de noviembre · Visorías Oficiales con Chivas y Santos Laguna

HORARIOS DE PARTICIPACIÓN
${slots}

⚠️ INDICACIONES IMPORTANTES
${tips}

🙏 Puntualidad para que cada jugador tenga la oportunidad de ser observado.

Detalle y registro:
${url}

Dudas: MiFicha · ${VISORIA_WHATSAPP_DISPLAY}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function visoriaContactWhatsAppHref() {
  const text = "Hola, quiero información de las visorías GPH / CRACKS en Querétaro.";
  return `https://wa.me/${VISORIA_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

/** Aviso simplificado LFPDPPP para el formulario de visorías. */
export const VISORIA_PRIVACY_SHORT = `${LEGAL_ENTITY.operator}, con domicilio en ${LEGAL_ENTITY.address}, es responsable del tratamiento de los datos del jugador y del padre, madre o tutor que captures en este registro (nombre, fecha de nacimiento, categoría, club, teléfono y, en su caso, correo). Los usamos para inscribir, organizar, contactar y confirmar sede/horario de las visorías GPH/CRACKS en Querétaro, y para compartirlos con los clubes visores participantes (evaluación deportiva). No vendemos datos. Puedes ejercer derechos ARCO en ${LEGAL_ENTITY.privacyEmail} o al ${VISORIA_WHATSAPP_DISPLAY}. El aviso integral está en ${LEGAL_ENTITY.url}${LEGAL_ROUTES.privacy}.`;

export function birthYearFromDate(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Rango amplio: categorías oficiales filtran con categoryFitsBirthYear; "otro" usa año real.
  if (year < 2000 || year > 2022) return null;
  return year;
}

export function categoryFitsBirthYear(category: VisoriaCategory, year: number) {
  if (category === "otro") {
    const band = VISORIA_EVENT.categories.otro;
    return year >= band.minYear && year <= band.maxYear;
  }
  const band = VISORIA_EVENT.categories[category];
  return year >= band.minYear && year <= band.maxYear;
}

export function digitsPhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeMxWhatsApp(value: string) {
  let digits = digitsPhone(value);
  if (digits.startsWith("52") && digits.length === 12) return digits;
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `52${digits.slice(1)}`;
  return digits;
}

export function isValidMxWhatsApp(value: string) {
  const digits = normalizeMxWhatsApp(value);
  return /^52\d{10}$/.test(digits);
}
