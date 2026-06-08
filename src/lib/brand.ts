export const BRAND_LOGO = "/brand/mificha-logo.png";
export const BRAND_ICON = "/brand/mificha-icon.png";
export const BRAND_OG_IMAGE = "/marketing/og-default.png";

export function getBrandLogoUrl(baseUrl?: string) {
  const appUrl =
    baseUrl?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://mificha.mx";

  return `${appUrl}${BRAND_LOGO}`;
}
