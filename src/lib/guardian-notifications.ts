import { Resend } from "resend";
import {
  buildMatchRewardsWhatsAppMessage,
  buildWeeklyRankShareLine,
  pickPrimaryAchievementKey,
} from "@/lib/player-achievements";
import { buildAchievementShareUrl, buildPlayerShareUrl } from "@/lib/share-ficha";
import { getGuardianNotificationReadiness } from "@/lib/guardian-readiness";
import { getWhatsAppProvider, sendWhatsAppMessage } from "@/lib/whatsapp";
import type { SupabaseClient } from "@supabase/supabase-js";

export { getGuardianNotificationReadiness } from "@/lib/guardian-readiness";

export type NotificationChannel = "whatsapp" | "email";
export type NotificationStatus = "sent" | "failed" | "skipped";

export interface GuardianNotificationResult {
  player_id: string;
  channel: NotificationChannel | "none";
  status: NotificationStatus;
  reason?: string;
}

interface NotifyPlayerRow {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  passport_score: number;
  is_public: boolean;
  public_consent_at: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  notify_guardian_on_match: boolean;
}

interface MatchStatRow {
  goals: number;
  assists: number;
  minutes_played: number;
}

export interface DispatchMatchNotificationsInput {
  supabase: SupabaseClient;
  academyId: string;
  matchId: string;
  opponent: string;
  playerIds: string[];
  previousPassportByPlayer: Map<string, number>;
  achievementKeysByPlayer: Map<string, string[]>;
  weeklyByPlayer: Map<
    string,
    {
      rank: number;
      total: number;
      positions_delta: number | null;
    }
  >;
}

function canNotifyPlayer(player: NotifyPlayerRow) {
  return getGuardianNotificationReadiness(player);
}

export function buildWelcomeFichaMessage(options: {
  firstName: string;
  lastName: string;
  academyName: string;
  slug: string;
}) {
  const url = buildPlayerShareUrl(options.slug);

  return [
    `Ficha verificada de ${options.firstName} ${options.lastName}`,
    `${options.academyName} · MiFicha`,
    `Consulta Passport Score y stats oficiales: ${url}`,
    "Recibirás avisos automáticos después de cada partido.",
  ].join("\n");
}

async function deliverGuardianMessage(options: {
  supabase: SupabaseClient;
  academyId: string;
  player: NotifyPlayerRow;
  matchId: string | null;
  message: string;
  emailSubject: string;
}): Promise<GuardianNotificationResult> {
  const { supabase, academyId, player, matchId, message, emailSubject } = options;
  const resendKey = process.env.RESEND_API_KEY;
  const resend =
    resendKey && resendKey !== "re_..." ? new Resend(resendKey) : null;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "MiFicha <onboarding@resend.dev>";
  const whatsAppProvider = getWhatsAppProvider();
  const phone = player.guardian_phone?.trim();
  const email = player.guardian_email?.trim().toLowerCase();

  if (phone && whatsAppProvider !== "link_only") {
    const sendResult = await sendWhatsAppMessage({ to: phone, message });
    const status: NotificationStatus = sendResult.ok ? "sent" : "failed";

    await logNotification(supabase, {
      academy_id: academyId,
      player_id: player.id,
      match_id: matchId,
      channel: "whatsapp",
      recipient: phone,
      status,
      error_message: sendResult.error,
    });

    if (sendResult.ok) {
      return { player_id: player.id, channel: "whatsapp", status: "sent" };
    }

    if (!email || !resend) {
      return {
        player_id: player.id,
        channel: "whatsapp",
        status: "failed",
        reason: sendResult.error,
      };
    }
  }

  if (email && resend) {
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailSubject,
      text: message,
    });

    const status: NotificationStatus = sendError ? "failed" : "sent";

    await logNotification(supabase, {
      academy_id: academyId,
      player_id: player.id,
      match_id: matchId,
      channel: "email",
      recipient: email,
      status,
      error_message: sendError?.message,
    });

    return {
      player_id: player.id,
      channel: "email",
      status,
      reason: sendError?.message,
    };
  }

  if (phone && whatsAppProvider === "link_only") {
    return {
      player_id: player.id,
      channel: "none",
      status: "skipped",
      reason:
        "WhatsApp API no configurada. Agrega email del tutor o configura Twilio/Meta.",
    };
  }

  return {
    player_id: player.id,
    channel: "none",
    status: "skipped",
    reason: "Configura RESEND_API_KEY para email automático.",
  };
}

function buildNotificationMessage(options: {
  player: NotifyPlayerRow;
  opponent: string;
  stats: MatchStatRow | null;
  previousPassport: number;
  achievementKeys: string[];
  weekly?: {
    rank: number;
    total: number;
    positions_delta: number | null;
  };
}) {
  const primaryKey =
    options.achievementKeys.length > 0
      ? pickPrimaryAchievementKey(options.achievementKeys)
      : null;

  return buildMatchRewardsWhatsAppMessage({
    firstName: options.player.first_name,
    lastName: options.player.last_name,
    opponent: options.opponent,
    goals: options.stats?.goals ?? 0,
    assists: options.stats?.assists ?? 0,
    minutes: options.stats?.minutes_played ?? 0,
    passportScore: options.player.passport_score,
    previousPassportScore: options.previousPassport,
    fichaUrl: buildPlayerShareUrl(options.player.slug),
    achievementKeys: options.achievementKeys,
    achievementShareUrl: primaryKey
      ? buildAchievementShareUrl(options.player.slug, primaryKey)
      : null,
    weeklyRankLine: options.weekly
      ? buildWeeklyRankShareLine({
          rank: options.weekly.rank,
          total: options.weekly.total,
          positionsDelta: options.weekly.positions_delta,
        })
      : null,
  });
}

async function logNotification(
  supabase: SupabaseClient,
  row: {
    academy_id: string;
    player_id: string;
    match_id: string | null;
    channel: NotificationChannel;
    recipient: string;
    status: NotificationStatus;
    error_message?: string;
  },
) {
  try {
    await supabase.from("guardian_notifications").insert({
      academy_id: row.academy_id,
      player_id: row.player_id,
      match_id: row.match_id,
      channel: row.channel,
      recipient: row.recipient,
      status: row.status,
      error_message: row.error_message ?? null,
    });
  } catch {
    // Tabla opcional hasta SQL #22
  }
}

export async function dispatchMatchUpdateNotifications(
  input: DispatchMatchNotificationsInput,
): Promise<GuardianNotificationResult[]> {
  const { supabase, academyId, matchId, opponent, playerIds } = input;

  if (playerIds.length === 0) return [];

  const [{ data: players }, { data: statsRows }] = await Promise.all([
    supabase
      .from("players")
      .select(
        "id, first_name, last_name, slug, passport_score, is_public, public_consent_at, guardian_name, guardian_email, guardian_phone, notify_guardian_on_match",
      )
      .eq("academy_id", academyId)
      .in("id", playerIds),
    supabase
      .from("match_stats")
      .select("player_id, goals, assists, minutes_played")
      .eq("match_id", matchId)
      .in("player_id", playerIds),
  ]);

  const statsByPlayer = new Map(
    (statsRows ?? []).map((row) => [row.player_id, row as MatchStatRow]),
  );

  const results: GuardianNotificationResult[] = [];

  for (const player of (players ?? []) as NotifyPlayerRow[]) {
    const eligibility = canNotifyPlayer(player);
    if (!eligibility.ok) {
      results.push({
        player_id: player.id,
        channel: "none",
        status: "skipped",
        reason: eligibility.reason,
      });
      continue;
    }

    const message = buildNotificationMessage({
      player,
      opponent,
      stats: statsByPlayer.get(player.id) ?? null,
      previousPassport: input.previousPassportByPlayer.get(player.id) ?? player.passport_score,
      achievementKeys: input.achievementKeysByPlayer.get(player.id) ?? [],
      weekly: input.weeklyByPlayer.get(player.id),
    });

    results.push(
      await deliverGuardianMessage({
        supabase,
        academyId,
        player,
        matchId,
        message,
        emailSubject: `Actualización de partido · ${player.first_name} ${player.last_name}`,
      }),
    );
  }

  return results;
}

export async function dispatchWelcomeFichaNotifications(input: {
  supabase: SupabaseClient;
  academyId: string;
  academyName: string;
  playerIds?: string[];
}): Promise<GuardianNotificationResult[]> {
  const { supabase, academyId, academyName, playerIds } = input;

  let query = supabase
    .from("players")
    .select(
      "id, first_name, last_name, slug, passport_score, is_public, public_consent_at, guardian_name, guardian_email, guardian_phone, notify_guardian_on_match",
    )
    .eq("academy_id", academyId);

  if (playerIds?.length) {
    query = query.in("id", playerIds);
  }

  const { data: players } = await query.order("last_name", { ascending: true });
  const results: GuardianNotificationResult[] = [];

  for (const player of (players ?? []) as NotifyPlayerRow[]) {
    const eligibility = canNotifyPlayer(player);
    if (!eligibility.ok) {
      results.push({
        player_id: player.id,
        channel: "none",
        status: "skipped",
        reason: eligibility.reason,
      });
      continue;
    }

    const message = buildWelcomeFichaMessage({
      firstName: player.first_name,
      lastName: player.last_name,
      academyName,
      slug: player.slug,
    });

    results.push(
      await deliverGuardianMessage({
        supabase,
        academyId,
        player,
        matchId: null,
        message,
        emailSubject: `Ficha verificada · ${player.first_name} ${player.last_name}`,
      }),
    );
  }

  return results;
}

export function summarizeNotificationResults(results: GuardianNotificationResult[]) {
  const sent = results.filter((row) => row.status === "sent").length;
  const failed = results.filter((row) => row.status === "failed").length;
  const skipped = results.filter((row) => row.status === "skipped").length;

  return { sent, failed, skipped, total: results.length };
}
