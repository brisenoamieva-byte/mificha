import { GPH_WHATSAPP_E164 } from "@/lib/gph-alliance";

export const GPH_INVITE_LANDING_PATH = "/fut/gph";
export const GPH_INVITE_OPS_PATH = "/fut/interno/gph-ola";

export const GPH_INVITE_CSV_COLUMNS = [
  "tutor_name",
  "tutor_phone",
  "tutor_email",
  "player_name",
  "city",
  "segment", // caliente | tibio | frio
  "last_touch", // YYYY-MM-DD opcional
] as const;

export type GphInviteSegment = "caliente" | "tibio" | "frio";

export function gphInviteTutorHref(opts?: {
  wave?: string | number;
  segment?: GphInviteSegment;
  absolute?: boolean;
}) {
  const params = new URLSearchParams({
    src: "gph",
    utm_source: "gph",
    utm_medium: "invite",
    utm_campaign: "gph_ola",
  });
  if (opts?.wave != null) params.set("utm_content", `wave${opts.wave}`);
  if (opts?.segment) params.set("segment", opts.segment);
  const path = `${GPH_INVITE_LANDING_PATH}?${params.toString()}`;
  if (!opts?.absolute) return path;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.mificha.mx";
  return `${origin}${path}`;
}

export function gphInviteWhatsAppText(opts?: {
  tutorName?: string;
  playerName?: string;
  wave?: string | number;
}) {
  const name = opts?.tutorName?.trim();
  const player = opts?.playerName?.trim();
  const link = gphInviteTutorHref({ wave: opts?.wave ?? 1, absolute: true, segment: "caliente" });
  const greeting = name ? `Hola ${name.split(" ")[0]},` : "Hola,";
  const playerBit = player ? ` de ${player}` : "";
  return `${greeting}

Desde GPH te invitamos a MiFicha: llena la ficha${playerBit}, lleva el seguimiento y hazlo visible para agentes de futbol en Explorar.

Piloto gratuito para familias GPH:
${link}

Cualquier duda por este mismo WhatsApp.`;
}

export function gphInviteWhatsAppHref(opts?: {
  tutorName?: string;
  playerName?: string;
  phoneE164?: string;
  wave?: string | number;
}) {
  const text = gphInviteWhatsAppText(opts);
  const phone = (opts?.phoneE164 ?? "").replace(/\D/g, "") || GPH_WHATSAPP_E164;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function gphInviteEmailSubject() {
  return "GPH te invita a MiFicha · ficha digital de tu hijo";
}

export function gphInviteEmailBody(opts?: {
  tutorName?: string;
  playerName?: string;
  wave?: string | number;
}) {
  const name = opts?.tutorName?.trim();
  const player = opts?.playerName?.trim();
  const link = gphInviteTutorHref({
    wave: opts?.wave ?? 1,
    absolute: true,
    segment: "tibio",
  });
  const greeting = name ? `Hola ${name.split(" ")[0]},` : "Hola,";
  const playerBit = player ? ` (${player})` : "";
  return `${greeting}

Como parte de la alianza GPH · MiFicha, te abrimos tu espacio de tutor: llena la ficha digital${playerBit}, lleva el seguimiento y publícalo en Explorar para que agentes de futbol te encuentren.

También verás oportunidades (visorías, convocatorias) y podrás solicitar entrenamiento con GPH.

Entra aquí (piloto gratuito):
${link}

Equipo GPH · MiFicha
hola@mificha.mx`;
}

export function gphInviteEmailMailto(opts?: {
  tutorName?: string;
  playerName?: string;
  email?: string;
  wave?: string | number;
}) {
  const subject = encodeURIComponent(gphInviteEmailSubject());
  const body = encodeURIComponent(gphInviteEmailBody(opts));
  const to = opts?.email?.trim() || "";
  return to
    ? `mailto:${to}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
}

export const GPH_INVITE_PLAYBOOK = {
  title: "Ola de invitación GPH → MiFicha",
  steps: [
    "Limpiar CSV con las columnas canónicas (tutor, teléfono, email, jugador, segmento).",
    "Ola 1 = solo calientes (evaluados / clientes recientes), 200–400 por día.",
    "Canal prioritario: WhatsApp desde el número GPH con la plantilla.",
    "Refuerzo a 5–7 días: 1 email corto a quien no abrió o no creó cuenta.",
    "Medir: clicks al landing, cuentas tutor, fichas con foto.",
    "Ajustar copy y seguir con tibios; fríos solo por email.",
  ],
  metrics: [
    "Click en link / enviados",
    "Signup tutor / clicks",
    "Ficha creada con foto / signups",
  ],
  targetsWave1:
    "De ~300 calientes: ≥15–25% click, ≥8–12% cuenta, ≥5% ficha con foto.",
} as const;
