/**
 * UTMs y copy de invitaciones virales (share 1:N, no solo 1:1).
 */

export function withShareUtm(
  url: string,
  opts: { campaign: string; content?: string; source?: string; medium?: string },
) {
  try {
    const parsed = new URL(
      url,
      typeof window !== "undefined" ? window.location.origin : "https://www.mificha.mx",
    );
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", opts.source ?? "share");
    }
    if (!parsed.searchParams.has("utm_medium")) {
      parsed.searchParams.set("utm_medium", opts.medium ?? "whatsapp");
    }
    if (!parsed.searchParams.has("utm_campaign")) {
      parsed.searchParams.set("utm_campaign", opts.campaign);
    }
    if (opts.content && !parsed.searchParams.has("utm_content")) {
      parsed.searchParams.set("utm_content", opts.content);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildTutorSignupHref(opts?: {
  refCode?: string | null;
  campaign?: string;
  absolute?: boolean;
}) {
  const params = new URLSearchParams({
    next: "/fut/tutor",
    utm_source: "referral",
    utm_medium: "whatsapp",
    utm_campaign: opts?.campaign ?? "invite_companero",
  });
  if (opts?.refCode) {
    params.set("ref", opts.refCode);
    params.set("utm_content", opts.refCode);
  }
  const path = `/fut/entrar?${params.toString()}`;
  if (!opts?.absolute) return path;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.mificha.mx";
  return `${origin}${path}`;
}

export function buildInviteTeammateWhatsAppHref(input: {
  playerName: string;
  publicCode?: string | null;
  shareUrl: string;
}) {
  const signup = buildTutorSignupHref({
    refCode: input.publicCode,
    absolute: true,
  });
  const preview = withShareUtm(input.shareUrl, {
    campaign: "invite_companero",
    content: input.publicCode || "preview",
  });
  const text = `Estamos armando juntos el catálogo nacional de jugadores amateurs en MiFicha.

Así se ve la ficha de ${input.playerName}${
    input.publicCode ? ` (${input.publicCode})` : ""
  }: ${preview}

Suma la de tu hijo (gratis, ~5 min) y ayuda a que tu ciudad tenga densidad real: ${signup}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function stateSlug(state: string) {
  return state
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
