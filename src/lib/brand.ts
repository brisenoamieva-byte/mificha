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
/** Glyph oficial (PNG) para usos de marketing; en UI preferir el ícono vectorial. */
export const BRAND_INSTAGRAM_ICON = "/brand/instagram.png";
/** Perfil oficial (sin params de tracking). */
export const BRAND_INSTAGRAM_URL = "https://www.instagram.com/mificha_mx/";
export const BRAND_INSTAGRAM_HANDLE = "@mificha_mx";

/** WhatsApp oficial MiFicha (México · Querétaro). */
export const BRAND_WHATSAPP_DISPLAY = "442 155 6155";
export const BRAND_WHATSAPP_E164 = "524421556155";

export function brandWhatsAppHref(prefill?: string) {
  const base = `https://wa.me/${BRAND_WHATSAPP_E164}`;
  if (!prefill?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefill.trim())}`;
}

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
