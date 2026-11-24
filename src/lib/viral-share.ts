/**
 * UTMs y copy de invitaciones virales (share 1:N, no solo 1:1).
 */

import { getAppBaseUrl } from "@/lib/app-url";

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
  return `${getAppBaseUrl()}${path}`;
}

/** Texto corto para compartir la ficha (jugador → amigos / equipo). */
export function buildPlayerShareWhatsAppText(input: {
  playerName: string;
  publicCode?: string | null;
  shareUrl: string;
}) {
  const url = withShareUtm(input.shareUrl, {
    campaign: "share_ficha",
    content: input.publicCode || "link",
  });
  const code = input.publicCode ? ` (${input.publicCode})` : "";
  return `Esta es mi ficha en MiFicha${code}: ${url}`;
}

export function buildInviteTeammateWhatsAppHref(input: {
  playerName: string;
  publicCode?: string | null;
  shareUrl: string;
}) {
  const signup = buildTutorSignupHref({
    refCode: input.publicCode,
    absolute: true,
    campaign: "invite_companero",
  });
  const preview = withShareUtm(input.shareUrl, {
    campaign: "invite_companero",
    content: input.publicCode || "preview",
  });
  const text = `Mira mi ficha en MiFicha${
    input.publicCode ? ` (${input.publicCode})` : ""
  }: ${preview}

Ármate la tuya y la vemos juntos: ${signup}`;
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
