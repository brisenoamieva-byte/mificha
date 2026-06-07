import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildReportEmailHtml,
  buildReportEmailText,
} from "@/lib/email/report-template";
import {
  emptySeasonStats,
  getReportCooldownStart,
  getReportSubject,
} from "@/lib/email/report-utils";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import type { Player, PlayerSeasonStat, Profile } from "@/types/database";

interface SendReportBody {
  academy_id?: string;
  season_id?: string;
}

interface PlayerWithStats extends Player {
  player_season_stats: PlayerSeasonStat[] | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendReportBody;
    const { academy_id, season_id } = body;

    if (!academy_id || !season_id) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["academy_id y season_id son requeridos."] },
        { status: 400 },
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || resendKey === "re_...") {
      return NextResponse.json(
        {
          sent: 0,
          failed: 0,
          errors: ["Configura RESEND_API_KEY en .env.local para enviar reportes."],
        },
        { status: 500 },
      );
    }

    const supabase = await getAuthedSupabaseClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["No autenticado."] },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .single<Pick<Profile, "role" | "email">>();

    if (profileError || !profile) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["Perfil no encontrado."] },
        { status: 403 },
      );
    }

    if (profile.role !== "academy_admin" && profile.role !== "admin") {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["Solo academy_admin puede enviar reportes."] },
        { status: 403 },
      );
    }

    const { data: academy, error: academyError } = await supabase
      .from("academies")
      .select("id, name, owner_id")
      .eq("id", academy_id)
      .single();

    if (academyError || !academy) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["Academia no encontrada."] },
        { status: 404 },
      );
    }

    if (academy.owner_id !== user.id && profile.role !== "admin") {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["No eres el administrador de esta academia."] },
        { status: 403 },
      );
    }

    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name, academy_id")
      .eq("id", season_id)
      .eq("academy_id", academy_id)
      .single();

    if (seasonError || !season) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["Temporada no encontrada para esta academia."] },
        { status: 404 },
      );
    }

    const { data: ownerProfile, error: ownerError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", academy.owner_id)
      .single<Pick<Profile, "email">>();

    if (ownerError || !ownerProfile?.email) {
      return NextResponse.json(
        {
          sent: 0,
          failed: 0,
          errors: ["No hay email del administrador (proxy del padre por ahora)."],
        },
        { status: 400 },
      );
    }

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*, player_season_stats(*)")
      .eq("academy_id", academy_id)
      .order("last_name", { ascending: true });

    if (playersError) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: [playersError.message] },
        { status: 500 },
      );
    }

    const playerRows = (players ?? []) as PlayerWithStats[];

    if (playerRows.length === 0) {
      return NextResponse.json(
        { sent: 0, failed: 0, errors: ["No hay jugadores en el plantel."] },
        { status: 400 },
      );
    }

    const cooldownStart = getReportCooldownStart();
    const { data: recentLogs } = await supabase
      .from("email_logs")
      .select("player_id")
      .eq("academy_id", academy_id)
      .eq("status", "sent")
      .gte("sent_at", cooldownStart);

    const recentlySentPlayerIds = new Set(
      (recentLogs ?? []).map((log) => log.player_id),
    );

    const resend = new Resend(resendKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? "MiFicha <onboarding@resend.dev>";

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const player of playerRows) {
      if (recentlySentPlayerIds.has(player.id)) {
        errors.push(
          `${player.first_name} ${player.last_name}: ya recibió reporte esta semana.`,
        );
        failed += 1;
        continue;
      }

      const seasonStats =
        player.player_season_stats?.find((item) => item.season_id === season_id) ??
        emptySeasonStats();

      const emailData = {
        playerFirstName: player.first_name,
        playerLastName: player.last_name,
        playerPhotoUrl: player.photo_url,
        playerSlug: player.slug,
        passportScore: player.passport_score,
        seasonName: season.name,
        stats: {
          total_matches: seasonStats.total_matches,
          total_goals: seasonStats.total_goals,
          total_assists: seasonStats.total_assists,
          total_minutes: seasonStats.total_minutes,
          total_yellow_cards: seasonStats.total_yellow_cards,
          total_red_cards: seasonStats.total_red_cards,
        },
        academyName: academy.name,
      };

      const subject = getReportSubject(
        `${player.first_name} ${player.last_name}`,
        season.name,
      );

      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: ownerProfile.email,
        subject,
        html: buildReportEmailHtml(emailData),
        text: buildReportEmailText(emailData),
      });

      const status = sendError ? "failed" : "sent";

      const { error: logError } = await supabase.from("email_logs").insert({
        academy_id,
        player_id: player.id,
        recipient_email: ownerProfile.email,
        subject,
        status,
      });

      if (logError) {
        errors.push(
          `${player.first_name} ${player.last_name}: no se pudo guardar el log (${logError.message}).`,
        );
      }

      if (sendError) {
        failed += 1;
        errors.push(
          `${player.first_name} ${player.last_name}: ${sendError.message}`,
        );
        continue;
      }

      sent += 1;
    }

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error inesperado al enviar reportes.";

    return NextResponse.json(
      { sent: 0, failed: 0, errors: [message] },
      { status: 500 },
    );
  }
}
