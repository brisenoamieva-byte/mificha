import { randomBytes, randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import {
  VISORIA_EVENT_ID,
  birthYearFromDate,
  categoryFitsBirthYear,
  isValidMxWhatsApp,
  normalizeMxWhatsApp,
  type VisoriaCategory,
  type VisoriaPosition,
  type VisoriaRegistrationRow,
} from "@/lib/visoria-event";

export type { VisoriaRegistrationRow };

export interface VisoriaRegistrationInput {
  player_full_name: string;
  birth_date: string;
  category: VisoriaCategory;
  position?: VisoriaPosition | "";
  current_club?: string;
  city?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  attend_thursday?: boolean;
  attend_friday?: boolean;
  gph_selected?: boolean;
  privacy_accepted?: boolean;
  image_rights_accepted?: boolean;
  clubs_share_accepted?: boolean;
  marketing_accepted?: boolean;
  notes?: string;
  source?: "platform" | "google_forms" | "whatsapp" | "import";
  honeypot?: string;
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function makeFolio() {
  return `VQ-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function parseVisoriaRegistration(
  raw: VisoriaRegistrationInput,
): { error: string } | { data: Record<string, unknown> } {
  if (clean(raw.honeypot)) {
    return { error: "No se pudo enviar el registro." };
  }

  const player = clean(raw.player_full_name);
  const guardian = clean(raw.guardian_name);
  const birth = clean(raw.birth_date);
  const category = clean(raw.category) as VisoriaCategory;
  const phone = normalizeMxWhatsApp(clean(raw.guardian_phone));
  const email = clean(raw.guardian_email).toLowerCase();
  const year = birthYearFromDate(birth);

  if (player.length < 5) return { error: "Escribe el nombre completo del jugador." };
  if (guardian.length < 5) return { error: "Escribe el nombre del padre, madre o tutor." };
  if (!year) return { error: "Revisa la fecha de nacimiento." };
  if (category !== "femenil" && category !== "varonil") {
    return { error: "Elige categoría femenil o varonil." };
  }
  if (!categoryFitsBirthYear(category, year)) {
    return {
      error:
        category === "femenil"
          ? "Femenil es para nacidas de 2008 a 2012."
          : "Varonil es para nacidos de 2010 a 2017.",
    };
  }
  if (!isValidMxWhatsApp(phone)) {
    return { error: "El WhatsApp debe ser un número mexicano a 10 dígitos." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "El correo no se ve válido. Déjalo vacío si no tienes." };
  }
  if (!raw.privacy_accepted) {
    return { error: "Para registrarte hay que aceptar el aviso de privacidad." };
  }
  if (!raw.image_rights_accepted) {
    return { error: "Hace falta la autorización de fotos y video del evento." };
  }
  if (!raw.clubs_share_accepted) {
    return { error: "Hace falta autorizar que los clubes visores vean los datos para evaluar." };
  }

  const gphSelected = Boolean(raw.gph_selected);
  const thursday = raw.attend_thursday !== false;
  const friday = Boolean(raw.attend_friday) || gphSelected;
  if (!thursday && !friday) {
    return { error: "Elige al menos un día. El jueves es la jornada abierta." };
  }
  if (friday && !gphSelected && !thursday) {
    return {
      error:
        "El viernes es solo para seleccionados GPH o para quien los visores elijan el jueves. Regístrate al jueves si aún no estás convocado.",
    };
  }

  const now = new Date().toISOString();
  const position = clean(raw.position);
  return {
    data: {
      event_id: VISORIA_EVENT_ID,
      folio: makeFolio(),
      source: raw.source ?? "platform",
      player_full_name: player,
      birth_date: birth,
      category,
      position: position || null,
      current_club: clean(raw.current_club) || null,
      city: clean(raw.city) || "Querétaro",
      guardian_name: guardian,
      guardian_phone: phone,
      guardian_email: email || null,
      attend_thursday: thursday,
      attend_friday: friday && gphSelected,
      gph_selected: gphSelected,
      privacy_accepted_at: now,
      image_rights_accepted_at: now,
      clubs_share_accepted_at: now,
      marketing_accepted_at: raw.marketing_accepted ? now : null,
      notes: clean(raw.notes) || null,
    },
  };
}

const OPS_BUCKET = "mificha-ops";
const VISORIA_STORE = `visorias/${VISORIA_EVENT_ID}.json`;

function isMissingTable(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  return (
    message.includes("visoria_registrations") ||
    message.includes("schema cache") ||
    error?.code === "PGRST205"
  );
}

async function ensureOpsBucket(admin: SupabaseClient) {
  const { data } = await admin.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === OPS_BUCKET)) return;
  await admin.storage.createBucket(OPS_BUCKET, { public: false });
}

async function readStorageRows(admin: SupabaseClient): Promise<VisoriaRegistrationRow[]> {
  const { data, error } = await admin.storage.from(OPS_BUCKET).download(VISORIA_STORE);
  if (error || !data) return [];
  const text = await data.text();
  try {
    const parsed = JSON.parse(text) as VisoriaRegistrationRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStorageRows(admin: SupabaseClient, rows: VisoriaRegistrationRow[]) {
  await ensureOpsBucket(admin);
  const body = new Blob([JSON.stringify(rows)], { type: "application/json" });
  const { error } = await admin.storage
    .from(OPS_BUCKET)
    .upload(VISORIA_STORE, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(error.message);
}

export async function insertVisoriaRegistration(
  admin: SupabaseClient,
  raw: VisoriaRegistrationInput,
) {
  const parsed = parseVisoriaRegistration(raw);
  if ("error" in parsed) {
    const error = new Error(parsed.error);
    (error as Error & { status: number }).status = 400;
    throw error;
  }

  const { data, error } = await admin
    .from("visoria_registrations")
    .insert(parsed.data)
    .select("*")
    .single();

  if (!error && data) return data as VisoriaRegistrationRow;

  if (error && (error.message.includes("duplicate") || error.code === "23505")) {
    const dup = new Error(
      "Este jugador ya está registrado con ese WhatsApp. Si necesitas corregir datos, escríbenos.",
    );
    (dup as Error & { status: number }).status = 409;
    throw dup;
  }

  if (error && !isMissingTable(error)) {
    throw new Error(error.message);
  }

  const rows = await readStorageRows(admin);
  const name = String(parsed.data.player_full_name).toLowerCase();
  const phone = String(parsed.data.guardian_phone);
  if (
    rows.some(
      (row) =>
        row.player_full_name.trim().toLowerCase() === name &&
        row.guardian_phone === phone,
    )
  ) {
    const dup = new Error(
      "Este jugador ya está registrado con ese WhatsApp. Si necesitas corregir datos, escríbenos.",
    );
    (dup as Error & { status: number }).status = 409;
    throw dup;
  }

  const row: VisoriaRegistrationRow = {
    id: randomUUID(),
    ...(parsed.data as Omit<VisoriaRegistrationRow, "id" | "created_at">),
    created_at: new Date().toISOString(),
  };
  rows.unshift(row);
  await writeStorageRows(admin, rows);
  return row;
}

export async function listVisoriaRegistrations(
  admin: SupabaseClient,
  eventId = VISORIA_EVENT_ID,
) {
  const { data, error } = await admin
    .from("visoria_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (!error) return (data ?? []) as VisoriaRegistrationRow[];
  if (!isMissingTable(error)) throw new Error(error.message);

  const rows = await readStorageRows(admin);
  return rows
    .filter((row) => row.event_id === eventId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function canManageVisorias(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
) {
  if (canAccessPitchDeck(user.id, user.email)) return true;
  return isGphEvaluatorUser(admin, user.id, user.email);
}
