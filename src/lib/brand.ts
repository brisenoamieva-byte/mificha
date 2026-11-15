/**
 * Marca maestra MiFicha: escudo MF (azul + punto verde).
 * Variantes:
 * - BRAND_ICON → UI (header, sidebar) — escudo solo
 * - BRAND_APP_ICON → favicon / PWA / apple-touch — escudo en canvas
 * Regenerar favicons: `node scripts/build-favicon.mjs`
 */
export const BRAND_ICON = "/brand/mificha-icon.png";
export const BRAND_APP_ICON = "/brand/mificha-app-icon.png";
export const BRAND_OG_IMAGE = "/marketing/og-default.png";
export { GPH_LOGO } from "@/lib/gph-alliance";

/** @deprecated Usar BRAND_ICON + BrandWordmark. Mantenido para compatibilidad en emails. */
export const BRAND_LOGO = BRAND_ICON;

function resolveAppUrl(baseUrl?: string) {
  return (
    baseUrl?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://mificha.mx"
  );
}

export function getBrandIconUrl(baseUrl?: string) {
  return `${resolveAppUrl(baseUrl)}${BRAND_ICON}`;
}

export function getBrandLogoUrl(baseUrl?: string) {
  return getBrandIconUrl(baseUrl);
}
