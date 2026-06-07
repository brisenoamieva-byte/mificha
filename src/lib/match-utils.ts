import type { MatchResult } from "@/types/database";

export const matchResultOptions: {
  value: MatchResult;
  label: string;
}[] = [
  { value: "win", label: "Victoria" },
  { value: "draw", label: "Empate" },
  { value: "loss", label: "Derrota" },
];

export function getMatchResultLabel(result: MatchResult) {
  return matchResultOptions.find((option) => option.value === result)?.label ?? result;
}

export function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function defaultSeasonName() {
  return `Temporada ${new Date().getFullYear()}`;
}
