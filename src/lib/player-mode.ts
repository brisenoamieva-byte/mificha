import { isUnknownBirthDate } from "@/lib/player-category";
import {
  summarizeTutorSeasons,
  type TutorChild,
  type TutorMaterial,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";

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
): PlayerModeMission[] {
  const hasMedia = (row: { storage_path?: string | null; url?: string | null }) =>
    Boolean(row.storage_path || row.url);
  const hasPhoto = materials.some((row) => row.kind === "photo" && hasMedia(row));
  const hasVideo = materials.some((row) => row.kind === "video" && hasMedia(row));
  const hasSeason = seasons.some(
    (row) => row.matches > 0 || row.minutes > 0 || row.goals > 0,
  );
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
      id: "season",
      label: "Tu temporada (PJ / goles / min)",
      done: hasSeason || Boolean(child.linked_player_id),
      hint: "Números que puedes presumir",
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
