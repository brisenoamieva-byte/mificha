import type { PlayerSeasonStat } from "@/types/database";
import { getPassportTier } from "@/lib/passport-score";

export const REPORT_COOLDOWN_DAYS = 7;

export function getPassportBarColor(score: number) {
  return getPassportTier(score).accent;
}

export function getReportCooldownStart() {
  const start = new Date();
  start.setDate(start.getDate() - REPORT_COOLDOWN_DAYS);
  return start.toISOString();
}

export function wasSentThisWeek(sentAt: string) {
  const cutoff = new Date(getReportCooldownStart());
  return new Date(sentAt) >= cutoff;
}

export function emptySeasonStats(): PlayerSeasonStat {
  return {
    id: "",
    player_id: "",
    season_id: "",
    total_matches: 0,
    total_goals: 0,
    total_assists: 0,
    total_minutes: 0,
    total_yellow_cards: 0,
    total_red_cards: 0,
    updated_at: new Date().toISOString(),
  };
}

export function getReportSubject(playerName: string, seasonName: string) {
  return `Reporte mensual de ${playerName} · ${seasonName}`;
}
