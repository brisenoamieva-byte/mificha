/**
 * Eventos mínimos de producto (cliente). Sin vendor: dataLayer + console en dev.
 * Ampliar a PostHog/Plausible conectando window.mfTrack.
 */
export type ProductEventName =
  | "view_home"
  | "start_ficha"
  | "create_ficha"
  | "sign_consent"
  | "view_explorar"
  | "share_click"
  | "visoria_register"
  | "map_click"
  | "invite_click"
  | "claim_visorias";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    mfTrack?: (event: ProductEventName, props?: Record<string, unknown>) => void;
  }
}

export function trackProductEvent(
  event: ProductEventName,
  props: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  const payload = { event, ...props, ts: new Date().toISOString() };
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    /* ignore */
  }
  try {
    window.mfTrack?.(event, props);
  } catch {
    /* ignore */
  }
  if (process.env.NODE_ENV === "development") {
    console.info("[mf-analytics]", payload);
  }
}
