export const BRAND_ICON = "/brand/mificha-icon.png";
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
