import { NextResponse } from "next/server";
import {
  getResendFromEmail,
  isResendProductionReady,
} from "@/lib/email/resend-config";
import {
  getDiagnosisBookingConfig,
  GPH_DIAGNOSIS_BOOKING_OPS_STEPS,
} from "@/lib/gph-alliance";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function probeColumn(
  table: "matches" | "players" | "player_profile_views",
  column: string,
) {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from(table).select(column).limit(0);
    return !error;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const [matchStatusOk, kickoffOk, guardianOk, profileViewsOk] = await Promise.all([
    probeColumn("matches", "status"),
    probeColumn("matches", "kickoff_at"),
    probeColumn("players", "guardian_email"),
    probeColumn("player_profile_views", "visitor_key"),
  ]);

  const scheduleKnown = matchStatusOk !== null && kickoffOk !== null;
  const guardianKnown = guardianOk !== null;

  const profileViewsKnown = profileViewsOk !== null;

  const from = getResendFromEmail();
  const fromIsDev = !from || from.includes("resend.dev");
  const hasResendKey = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.RESEND_API_KEY.trim() !== "re_...",
  );
  const booking = getDiagnosisBookingConfig();

  return NextResponse.json({
    sql: {
      matchSchedule: scheduleKnown ? matchStatusOk && kickoffOk : null,
      guardianContact: guardianKnown ? guardianOk : null,
      profileViews: profileViewsKnown ? profileViewsOk : null,
    },
    resend: {
      ready: isResendProductionReady(),
      hasKey: hasResendKey,
      fromIsDev,
      fromDomain: from.includes("@")
        ? from.replace(/^.*@/, "").replace(/>.*$/, "").trim()
        : null,
      hint: isResendProductionReady()
        ? null
        : fromIsDev
          ? "RESEND_FROM_EMAIL sigue en resend.dev. Usa un dominio verificado en la misma cuenta Resend de la API key (mificha.mx está registrado en otra cuenta)."
          : "Configura RESEND_FROM_EMAIL con un dominio verificado en esta cuenta Resend.",
    },
    mercadoPago: {
      ready: isMercadoPagoConfigured(),
      hint: isMercadoPagoConfigured()
        ? null
        : "Falta MERCADOPAGO_ACCESS_TOKEN en este entorno.",
    },
    diagnosisBooking: {
      ready: booking.ready,
      source: booking.source,
      hint: booking.ready
        ? booking.source === "diagnosis"
          ? "Calendario de diagnóstico configurado (NEXT_PUBLIC_GPH_DIAGNOSIS_CALENDLY_URL)."
          : "Usando NEXT_PUBLIC_GPH_CALENDLY_URL compartido para diagnóstico."
        : "Falta el link de Calendly / Google Appointment. Los CTAs siguen en WhatsApp.",
      opsSteps: GPH_DIAGNOSIS_BOOKING_OPS_STEPS,
    },
    launchFree: process.env.NEXT_PUBLIC_LAUNCH_FREE !== "false",
    checksAvailable: scheduleKnown && guardianKnown && profileViewsKnown,
  });
}
