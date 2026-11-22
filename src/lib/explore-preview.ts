/** Vista previa pública (sin sesión / sin Explorar Pro): muestra muestra, no el catálogo. */
export const EXPLORE_GUEST_PREVIEW_LIMIT = 6;

export function explorePreviewPlayers<T>(players: T[], unlocked: boolean): T[] {
  if (unlocked) return players;
  return players.slice(0, EXPLORE_GUEST_PREVIEW_LIMIT);
}
