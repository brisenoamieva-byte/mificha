/** Vista previa pública (sin sesión / sin Explorar Pro): muestra muestra, no el catálogo. */
export const EXPLORE_GUEST_PREVIEW_LIMIT = 6;

/**
 * Página inicial / “Mostrar más” en Explorar (sesión desbloqueada).
 * 20 ≈ 3–4 pantallas en móvil con foto; evita pintar decenas de cards de golpe.
 */
export const EXPLORE_PAGE_SIZE = 20;

export function explorePreviewPlayers<T>(players: T[], unlocked: boolean): T[] {
  if (unlocked) return players;
  return players.slice(0, EXPLORE_GUEST_PREVIEW_LIMIT);
}
