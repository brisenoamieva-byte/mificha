import type { DominantFoot, Player, PlayerPosition } from "@/types/database";

export const positionOptions: {
  value: PlayerPosition;
  label: string;
}[] = [
  { value: "goalkeeper", label: "Portero" },
  { value: "defender", label: "Defensa" },
  { value: "midfielder", label: "Mediocampista" },
  { value: "forward", label: "Delantero" },
];

export const dominantFootOptions: {
  value: DominantFoot;
  label: string;
}[] = [
  { value: "right", label: "Derecho" },
  { value: "left", label: "Izquierdo" },
  { value: "both", label: "Ambos" },
];

export function playerSlug(firstName: string, lastName: string) {
  const base = `${firstName} ${lastName}`.trim();
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPlayerSlug(firstName: string, lastName: string) {
  const base = playerSlug(firstName, lastName);
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `${base}-${suffix}`;
}

export function buildPublicPlayerUrl(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/j/${slug}`;
}

export function getDominantFootLabel(foot: DominantFoot) {
  return dominantFootOptions.find((option) => option.value === foot)?.label ?? foot;
}

export function getPositionBadgeClass(position: PlayerPosition) {
  switch (position) {
    case "goalkeeper":
      return "bg-red-100 text-red-700";
    case "defender":
      return "bg-blue-100 text-blue-700";
    case "midfielder":
      return "bg-amber-100 text-amber-800";
    case "forward":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export { getPassportBarClass } from "@/lib/passport-score";

export function isProfileComplete(player: Player) {
  return Boolean(player.photo_url && player.video_url);
}

export function getPlayerInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}
