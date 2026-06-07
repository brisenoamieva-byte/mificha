import type { MatchResult, MatchStatus } from "@/types/database";

export const matchResultOptions: {
  value: MatchResult;
  label: string;
}[] = [
  { value: "win", label: "Victoria" },
  { value: "draw", label: "Empate" },
  { value: "loss", label: "Derrota" },
];

export const matchStatusOptions: {
  value: MatchStatus;
  label: string;
}[] = [
  { value: "scheduled", label: "Programado" },
  { value: "completed", label: "Jugado" },
  { value: "postponed", label: "Pospuesto" },
  { value: "cancelled", label: "Cancelado" },
];

export function getMatchResultLabel(result: MatchResult | null) {
  if (!result) return "Por jugar";
  return matchResultOptions.find((option) => option.value === result)?.label ?? result;
}

export function getMatchStatusLabel(status: MatchStatus) {
  return (
    matchStatusOptions.find((option) => option.value === status)?.label ?? status
  );
}

export function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function formatKickoffDateTime(
  kickoffAt: string | null,
  fallbackDate?: string,
) {
  if (kickoffAt) {
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Mexico_City",
    }).format(new Date(kickoffAt));
  }

  if (fallbackDate) {
    return `${formatMatchDate(fallbackDate)} · horario por confirmar`;
  }

  return "Fecha por confirmar";
}

export function formatKickoffTime(kickoffAt: string | null) {
  if (!kickoffAt) return null;

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Mexico_City",
  }).format(new Date(kickoffAt));
}

export function buildVenueMapsUrl(venueName?: string | null, venueAddress?: string | null) {
  const query = [venueName, venueAddress].filter(Boolean).join(", ");
  if (!query.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

export function combineDateAndTimeToIso(date: string, time: string) {
  const local = new Date(`${date}T${time}:00`);
  return local.toISOString();
}

export function defaultSeasonName() {
  return `Temporada ${new Date().getFullYear()}`;
}

export function isUpcomingMatch(
  status: MatchStatus,
  kickoffAt: string | null,
  matchDate: string,
) {
  if (status !== "scheduled" && status !== "postponed") return false;

  const reference = kickoffAt
    ? new Date(kickoffAt)
    : new Date(`${matchDate}T23:59:59`);

  return reference.getTime() >= Date.now() - 1000 * 60 * 60 * 3;
}

export function isCompletedMatch(status: MatchStatus) {
  return status === "completed";
}
