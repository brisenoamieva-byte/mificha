import { buildPublicPlayerUrl } from "@/lib/player-utils";

export function buildPlayerShareUrl(slug: string) {
  return buildPublicPlayerUrl(slug);
}

export function buildAchievementShareUrl(slug: string, achievementKey: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/j/${slug}/logro/${achievementKey}`;
}

export function buildPlayerWhatsAppShareUrl(
  slug: string,
  firstName: string,
  lastName: string,
) {
  const url = buildPlayerShareUrl(slug);
  const message = `Ficha verificada de ${firstName} ${lastName} en MiFicha: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
