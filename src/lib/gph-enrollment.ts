import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  acceptGphAgreementAsTutor,
  createGphAgreementDraft,
  listGphAgreementsForTutor,
  resolveGphAcademy,
  sendGphAgreement,
  setGphAgreementSealedPdf,
  uploadSealedAgreementPdf,
  type GphAgreement,
} from "@/lib/gph-agreements";
import { buildGphAgreementPdfBytes } from "@/lib/gph-agreement-pdf";
import { notifyGphAgreementSigned } from "@/lib/email/gph-agreement-notify";
import {
  GPH_ACADEMY_SLUG,
  GPH_SCHEDULES,
  GPH_SEDES,
  computeGphPackage,
  type GphPositionId,
  type GphScheduleId,
  type GphSedeId,
} from "@/lib/gph-reglamento-content";
import { buildPlayerSlug, buildPublicPlayerUrl } from "@/lib/player-utils";
import { createTutorChild, listGuardianChildren } from "@/lib/tutor-family";
import { childMembershipForAcademy } from "@/lib/tutor-memberships";
import { linkTutorChildToPlayer } from "@/lib/tutor-player-link";
import type { DominantFoot, PlayerPosition } from "@/types/database";

function nameKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** México: guarda 10 dígitos locales; acepta +52. */
function normalizeMxPhone(raw: string) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export const GPH_ENROLLMENT_PATH = "/fut/gph/inscripcion";

export function gphEnrollmentHref(opts?: {
  absolute?: boolean;
  utm?: Record<string, string>;
}) {
  const params = new URLSearchParams({
    utm_source: "gph",
    utm_medium: "whatsapp",
    utm_campaign: "inscripcion_alumnos",
    ...(opts?.utm ?? {}),
  });
  const path = `${GPH_ENROLLMENT_PATH}?${params.toString()}`;
  if (!opts?.absolute) return path;
  const base = (
    process.env.NEXT_PUBLIC_APP_URL || "https://www.mificha.mx"
  ).replace(/\/$/, "");
  return `${base}${path}`;
}

function splitPlayerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Jugador", lastName: "GPH" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "—" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function mapFieldPosition(position: GphPositionId): PlayerPosition {
  return position === "portero" ? "goalkeeper" : "midfielder";
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export type GphEnrollInput = {
  guardianName: string;
  guardianPhone: string;
  playerName: string;
  birthDate: string;
  sede: GphSedeId;
  schedule: GphScheduleId;
  position: GphPositionId;
  dominantFoot?: DominantFoot;
  acceptorName: string;
  privacyAccepted: boolean;
  reglamentoAccepted: boolean;
  publicCode?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export async function enrollGphStudent(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  input: GphEnrollInput,
): Promise<{
  agreement: GphAgreement;
  reused: boolean;
  publicCode: string | null;
}> {
  if (!input.reglamentoAccepted) {
    throw new Error("Debes aceptar el reglamento GPH.");
  }
  if (!input.privacyAccepted) {
    throw new Error("Debes aceptar el aviso de privacidad.");
  }

  const guardianName = input.guardianName.trim();
  const guardianPhone = normalizeMxPhone(input.guardianPhone);
  const playerName = input.playerName.trim();
  const birthDate = input.birthDate.trim().slice(0, 10);
  const acceptorName = input.acceptorName.trim() || guardianName;

  if (guardianName.length < 2) throw new Error("Escribe el nombre del tutor.");
  if (guardianPhone.length !== 10) {
    throw new Error("WhatsApp del tutor: 10 dígitos (México).");
  }
  if (playerName.length < 2) throw new Error("Escribe el nombre del jugador.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw new Error("Fecha de nacimiento inválida.");
  }
  const birth = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(birth.getTime()) || birth.getFullYear() < 1995 || birth > new Date()) {
    throw new Error("Revisa la fecha de nacimiento.");
  }

  const sede = (
    GPH_SEDES.some((row) => row.id === input.sede) ? input.sede : "casa_juventud"
  ) as GphSedeId;
  const schedule = (
    GPH_SCHEDULES.some((row) => row.id === input.schedule)
      ? input.schedule
      : "lun_mie"
  ) as GphScheduleId;
  const position = (input.position === "portero" ? "portero" : "campo") as GphPositionId;
  const foot: DominantFoot =
    input.dominantFoot === "left" || input.dominantFoot === "both"
      ? input.dominantFoot
      : "right";

  const academy = await resolveGphAcademy(admin);
  const children = await listGuardianChildren(admin, user, guardianPhone);
  const existingChild = children.find(
    (row) => nameKey(row.player_name) === nameKey(playerName),
  );

  const existingAgreements = await listGphAgreementsForTutor(admin, user.id);
  const existing = existingAgreements.find(
    (row) =>
      row.academy_id === academy.id &&
      nameKey(row.fields.player_name) === nameKey(playerName) &&
      (row.status === "signed_tutor" ||
        row.status === "active" ||
        row.status === "sent"),
  );
  if (existing) {
    return {
      agreement: existing,
      reused: true,
      publicCode: existingChild?.public_code ?? null,
    };
  }

  let child = existingChild;
  if (!child) {
    child = await createTutorChild(admin, user, {
      player_name: playerName,
      guardian_phone: guardianPhone,
      guardian_kind: "tutor",
      birth_date: birthDate,
      position: mapFieldPosition(position),
      dominant_foot: foot,
      club: "Academia Real GPH",
      city: "Querétaro",
      state: "Querétaro",
      public_code: input.publicCode,
      contact_whatsapp: guardianPhone,
      show_contact_whatsapp: true,
    });
  }

  const { firstName, lastName } = splitPlayerName(playerName);
  const alreadyLinked = childMembershipForAcademy(child, academy.id);
  let playerId = alreadyLinked?.player_id ?? null;

  if (!playerId) {
    const { data: plantelMatches } = await admin
      .from("players")
      .select("id, first_name, last_name, birth_date")
      .eq("academy_id", academy.id)
      .eq("birth_date", birthDate);

    playerId =
      plantelMatches?.find(
        (row) =>
          nameKey(`${row.first_name ?? ""} ${row.last_name ?? ""}`) ===
          nameKey(playerName),
      )?.id ?? null;
  }

  if (!playerId) {
    const slug = `${buildPlayerSlug(firstName, lastName)}-${randomUUID().slice(0, 6)}`;
    const baseRow = {
      academy_id: academy.id,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      position: mapFieldPosition(position),
      dominant_foot: foot,
      slug,
      qr_code: buildPublicPlayerUrl(slug),
      is_public: false,
    };
    const withGuardian = {
      ...baseRow,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      guardian_email: (user.email ?? "").trim().toLowerCase() || null,
    };
    let insertedId: string | null = null;
    const firstTry = await admin
      .from("players")
      .insert(withGuardian)
      .select("id")
      .single();
    if (firstTry.error) {
      const secondTry = await admin.from("players").insert(baseRow).select("id").single();
      if (secondTry.error) throw new Error(secondTry.error.message);
      insertedId = secondTry.data.id;
    } else {
      insertedId = firstTry.data.id;
    }
    playerId = insertedId;
  }

  if (!playerId) {
    throw new Error("No se pudo crear el jugador en el plantel GPH.");
  }

  if (!alreadyLinked || alreadyLinked.player_id !== playerId) {
    try {
      await linkTutorChildToPlayer(admin, user.id, child.id, playerId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("Ya hay un vínculo con esa academia")) throw err;
      // Ya ligado a GPH con otro/mismo jugador: seguimos con el playerId actual.
    }
  }

  const start = new Date();
  const end = addDays(start, 30);
  const pkg = computeGphPackage({
    levelId: "desarrollo",
    paymentMode: "monthly",
    months: 1,
    inscriptionExempt: false,
  });

  const draft = await createGphAgreementDraft(admin, {
    academyId: academy.id,
    createdBy: user.id,
    playerId,
    tutorChildId: child.id,
    guardianUserId: user.id,
    fields: {
      player_name: playerName,
      birth_date: birthDate,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      guardian_email: (user.email ?? "").trim().toLowerCase(),
      sede,
      schedule,
      position,
      group_level: "Pendiente de diagnóstico",
      level_id: "desarrollo",
      payment_mode: "monthly",
      months: 1,
      inscription_exempt: false,
      amount_agreed_mxn: pkg.totalMxn,
      program_start: isoDate(start),
      program_end: isoDate(end),
      payment_note:
        "Alta por liga pública · nivel y monto provisionales hasta confirmación GPH",
    },
  });

  const sent = await sendGphAgreement(admin, draft.id);
  const signed = await acceptGphAgreementAsTutor(admin, {
    agreementId: sent.id,
    guardianUserId: user.id,
    acceptorName,
    acceptorEmail: user.email,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });

  const pdf = buildGphAgreementPdfBytes(signed);
  const path = await uploadSealedAgreementPdf(admin, signed.id, pdf);
  const withPdf = await setGphAgreementSealedPdf(admin, signed.id, path);
  void notifyGphAgreementSigned(withPdf);

  return {
    agreement: withPdf,
    reused: false,
    publicCode: child.public_code ?? null,
  };
}

/** @deprecated Prefer gphEnrollmentHref — slug de academia. */
export const GPH_ENROLLMENT_ACADEMY_SLUG = GPH_ACADEMY_SLUG;
