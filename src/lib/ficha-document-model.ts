import { calculateAge, getPositionLabel } from "@/lib/dashboard-utils";
import { DEMO_FICHA_PREVIEW } from "@/lib/demo-ficha-preview";
import { computeSeasonSummary } from "@/lib/ficha-content";
import { getAchievementDefinition } from "@/lib/player-achievements";
import { computeParticipationBreakdown } from "@/lib/player-visual-profile";
import { formatPlayerCategory } from "@/lib/player-category";
import type { PublicPlayerData } from "@/lib/public-player";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import type { MatchPerformanceRow } from "@/lib/performance-analytics";
import { buildPublicGphEvaluationPath } from "@/lib/gph-player-link";
import { buildPublicPlayerUrl, getDominantFootLabel } from "@/lib/player-utils";
import type { PlayerPosition, PlayerSeasonStat } from "@/types/database";

export interface FichaDocumentAchievement {
  key: string;
  title: string;
  emoji: string;
}

export interface FichaDocumentLastMatch {
  headline: string;
  detail: string;
}

export interface FichaDocumentParticipation {
  starts: number;
  subs: number;
  noMinutes: number;
}

export interface FichaDocumentModel {
  documentId?: string;
  seasonLabel: string;
  fullName: string;
  age: number | null;
  categoryLabel: string;
  positionLabel: string;
  secondaryPositionLabel?: string | null;
  academyName: string;
  academyLogoUrl?: string | null;
  metaLine: string;
  photoSrc: string;
  photoIsLocal: boolean;
  seasonStats: Pick<
    PlayerSeasonStat,
    | "total_matches"
    | "total_goals"
    | "total_assists"
    | "total_minutes"
    | "total_yellow_cards"
    | "total_red_cards"
  > | null;
  lastMatch?: FichaDocumentLastMatch | null;
  participation?: FichaDocumentParticipation | null;
  coach: {
    primary: PlayerPosition;
    secondary?: PlayerPosition | null;
    traits: {
      technical: number | null;
      tactical: number | null;
      physical: number | null;
      attitude: number | null;
    };
    notes?: string | null;
  };
  achievements: FichaDocumentAchievement[];
  showVerified: boolean;
  showConsent: boolean;
  showGph?: boolean;
  gphHref?: string | null;
  publicUrlDisplay: string;
  publicUrlQr: string;
  isDemo?: boolean;
}

function formatLastMatch(row: MatchPerformanceRow): FichaDocumentLastMatch {
  const score =
    row.goalsFor != null && row.goalsAgainst != null
      ? `${row.goalsFor}-${row.goalsAgainst}`
      : "—";

  const detailParts: string[] = [];
  if (row.goals > 0) {
    detailParts.push(`${row.goals} gol${row.goals === 1 ? "" : "es"}`);
  }
  if (row.minutes > 0) {
    detailParts.push(`${row.minutes} min`);
  }

  return {
    headline: `vs ${row.opponent} · ${score}`,
    detail: detailParts.length > 0 ? detailParts.join(" · ") : "Partido reciente",
  };
}

function buildMetaLine(parts: Array<string | null | undefined | false>) {
  return parts.filter(Boolean).join(" · ");
}

export function buildDemoFichaDocument(): FichaDocumentModel {
  const demo = DEMO_FICHA_PREVIEW;

  return {
    documentId: "demo-ficha-documento",
    seasonLabel: demo.seasonLabel,
    fullName: demo.fullName,
    age: demo.age,
    categoryLabel: demo.category,
    positionLabel: demo.positionLabel,
    secondaryPositionLabel: demo.secondaryLabel,
    academyName: demo.academy,
    academyLogoUrl: demo.academyLogoSrc,
    metaLine: buildMetaLine([
      demo.city,
      `Dorsal ${demo.jerseyNumber}`,
      demo.dominantFootLabel,
      demo.heightCm ? `${demo.heightCm} cm` : null,
    ]),
    photoSrc: demo.photoSrc,
    photoIsLocal: true,
    seasonStats: {
      total_matches: demo.stats.matches,
      total_goals: demo.stats.goals,
      total_assists: demo.stats.assists,
      total_minutes: demo.stats.minutes,
      total_yellow_cards: demo.stats.yellowCards,
      total_red_cards: demo.stats.redCards,
    },
    lastMatch: {
      headline: `vs ${demo.lastMatch.opponent} · ${demo.lastMatch.score}`,
      detail: demo.lastMatch.detail,
    },
    participation: demo.participation,
    coach: {
      primary: demo.position,
      secondary: demo.secondaryPosition,
      traits: demo.traits,
      notes: demo.coachNotes,
    },
    achievements: [...demo.achievements],
    showVerified: true,
    showConsent: true,
    showGph: true,
    gphHref: buildPublicGphEvaluationPath(demo.slug),
    publicUrlDisplay: demo.publicUrl,
    publicUrlQr: demo.publicUrl.startsWith("http")
      ? demo.publicUrl
      : `https://${demo.publicUrl}`,
    isDemo: true,
  };
}

export function buildPublicFichaDocument(data: PublicPlayerData): FichaDocumentModel {
  const { player, currentSeasonStats, currentSeasonName, seasonProgress, achievements } =
    data;

  const age = calculateAge(player.birth_date);
  const positionLabel = getPositionLabel(player.position);
  const secondaryPositionLabel = player.secondary_position
    ? getPositionLabel(player.secondary_position)
    : null;

  const lastRow = seasonProgress[seasonProgress.length - 1];
  const participation =
    seasonProgress.length > 0 ? computeParticipationBreakdown(seasonProgress) : null;

  const publicUrl = buildPublicPlayerUrl(player.slug);

  const metaParts: Array<string | null | false> = [
    player.academies?.city ?? null,
    player.jersey_number != null ? `Dorsal ${player.jersey_number}` : null,
    player.dominant_foot ? getDominantFootLabel(player.dominant_foot) : null,
    player.height_cm ? `${player.height_cm} cm` : null,
  ];

  return {
    seasonLabel: currentSeasonName ?? CURRENT_SEASON_LABEL,
    fullName: `${player.first_name} ${player.last_name}`,
    age,
    categoryLabel: formatPlayerCategory(player.birth_date),
    positionLabel,
    secondaryPositionLabel,
    academyName: player.academies?.name ?? "Academia",
    academyLogoUrl: player.academies?.logo_url,
    metaLine: buildMetaLine(metaParts),
    photoSrc: player.photo_url ?? "",
    photoIsLocal: Boolean(player.photo_url?.startsWith("/")),
    seasonStats: currentSeasonStats,
    lastMatch: lastRow ? formatLastMatch(lastRow) : null,
    participation:
      participation && participation.total > 0
        ? {
            starts: participation.starts,
            subs: participation.subs,
            noMinutes: participation.noMinutes,
          }
        : null,
    coach: {
      primary: player.position,
      secondary: player.secondary_position,
      traits: {
        technical: player.trait_technical,
        tactical: player.trait_tactical,
        physical: player.trait_physical,
        attitude: player.trait_attitude,
      },
      notes: player.coach_notes,
    },
    achievements: achievements
      .map((item) => {
        const definition = getAchievementDefinition(item.achievement_key);
        if (!definition) return null;
        return {
          key: item.achievement_key,
          title: definition.title,
          emoji: definition.emoji,
        };
      })
      .filter((item): item is FichaDocumentAchievement => item != null),
    showVerified: player.is_public,
    showConsent: Boolean(player.public_consent_at),
    showGph: Boolean(data.gph),
    gphHref: data.gph ? buildPublicGphEvaluationPath(player.slug) : null,
    publicUrlDisplay: publicUrl.replace(/^https?:\/\//, ""),
    publicUrlQr: publicUrl,
    isDemo: false,
  };
}

export { computeSeasonSummary };
