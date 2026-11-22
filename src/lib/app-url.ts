/** Host canónico público (apex ya redirige 308 → www en Vercel). */
const CANONICAL_ORIGIN = "https://www.mificha.mx";

/**
 * Base URL pública de la app.
 * Normaliza apex → www para metadata, sitemap y canonicals.
 */
export function getAppBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? CANONICAL_ORIGIN;

  try {
    const url = new URL(raw);
    if (url.hostname === "mificha.mx") {
      url.hostname = "www.mificha.mx";
      return url.origin;
    }
    return url.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}
