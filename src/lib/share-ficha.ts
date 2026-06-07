import { buildPublicPlayerUrl } from "@/lib/player-utils";

export function buildPlayerShareUrl(slug: string) {
  return buildPublicPlayerUrl(slug);
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
