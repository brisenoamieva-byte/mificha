import { isUnknownBirthDate } from "@/lib/player-category";
import {
  summarizeTutorSeasons,
  type TutorChild,
  type TutorMaterial,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import type {
  TutorLastMatchHighlight,
  TutorLinkedPerformance,
} from "@/lib/tutor-linked-performance";

export type PlayerModeMission = {
  id: string;
  label: string;
  done: boolean;
  hint: string;
};

export type PlayerModeSeasonStats = {
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
};

export function buildPlayerModeStats(
  seasons: TutorSeasonStat[],
  performance?: TutorLinkedPerformance | null,
): PlayerModeSeasonStats {
  const fromTutor = summarizeTutorSeasons(seasons);
  const academy = performance?.stats;
  if (
    academy &&
    (academy.total_matches > 0 ||
      academy.total_goals > 0 ||
      academy.total_assists > 0 ||
      academy.total_minutes > 0)
  ) {
    return {
      matches: academy.total_matches,
      goals: academy.total_goals,
      assists: academy.total_assists,
      minutes: academy.total_minutes,
    };
  }
  return fromTutor;
}

export function buildPlayerModeMissions(
  child: TutorChild,
  materials: Array<
    Pick<TutorMaterial, "kind" | "storage_path"> & { url?: string | null }
  >,
  seasons: TutorSeasonStat[],
  performance?: TutorLinkedPerformance | null,
): PlayerModeMission[] {
  const hasMedia = (row: { storage_path?: string | null; url?: string | null }) =>
    Boolean(row.storage_path || row.url);
  const hasPhoto = materials.some((row) => row.kind === "photo" && hasMedia(row));
  const hasVideo = materials.some((row) => row.kind === "video" && hasMedia(row));
  const hasSeason = seasons.some(
    (row) => row.matches > 0 || row.minutes > 0 || row.goals > 0,
  );
  const hasLastMatch = Boolean(performance?.lastMatch);
  const hasPosition = Boolean(child.profile.position?.trim());
  const hasBirth = !isUnknownBirthDate(child.profile.birth_date);

  return [
    {
      id: "photo",
      label: "Foto de portada",
      done: hasPhoto,
      hint: "Así te reconocen en la carta",
    },
    {
      id: "identity",
      label: "Posición y categoría",
      done: hasPosition && hasBirth,
      hint: "Para jugar en tu Sub-X",
    },
    {
      id: "match",
      label: "Tu último partido",
      done: hasLastMatch || hasSeason,
      hint: "Cuando la academia registra el acta, aquí se enciende",
    },
    {
      id: "video",
      label: "Clip de 15s",
      done: hasVideo,
      hint: "Opcional, pero pega fuerte con amigos",
    },
  ];
}

export function playerModeSharePath(basePath: string) {
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}vista=jugador`;
}

/** Texto WhatsApp / share de la carta post-partido. */
export function buildLastMatchShareText(input: {
  playerName: string;
  publicCode?: string | null;
  lastMatch: TutorLastMatchHighlight;
  url: string;
}) {
  const { lastMatch, playerName, publicCode, url } = input;
  const bits: string[] = [];
  if (lastMatch.minutes > 0) bits.push(`${lastMatch.minutes} min`);
  if (lastMatch.goals > 0) {
    bits.push(`${lastMatch.goals} gol${lastMatch.goals === 1 ? "" : "es"}`);
  }
  if (lastMatch.assists > 0) {
    bits.push(
      `${lastMatch.assists} asistencia${lastMatch.assists === 1 ? "" : "s"}`,
    );
  }
  if (bits.length === 0) bits.push("estuve en la convocatoria");

  const score =
    lastMatch.goalsFor != null && lastMatch.goalsAgainst != null
      ? ` (${lastMatch.goalsFor}-${lastMatch.goalsAgainst})`
      : "";
  const code = publicCode ? ` (${publicCode})` : "";
  return `Este partido vs ${lastMatch.opponent}${score}: ${bits.join(" · ")}. Carta de ${playerName}${code}: ${url}`;
}
