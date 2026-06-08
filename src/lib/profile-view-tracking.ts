import { createHash } from "crypto";

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

export function buildVisitorKey(request: Request, slug: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return createHash("sha256")
    .update(`${ip}|${userAgent}|${slug}`)
    .digest("hex")
    .slice(0, 32);
}

export function getProfileViewDedupSince() {
  return new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
}

export interface AcademyProfileViewStats {
  total_views: number;
  unique_visitors: number;
  views_last_7_days: number;
}

export const EMPTY_PROFILE_VIEW_STATS: AcademyProfileViewStats = {
  total_views: 0,
  unique_visitors: 0,
  views_last_7_days: 0,
};

export function parseProfileViewStats(raw: unknown): AcademyProfileViewStats {
  if (!raw || typeof raw !== "object") {
    return EMPTY_PROFILE_VIEW_STATS;
  }

  const stats = raw as Record<string, unknown>;

  return {
    total_views: typeof stats.total_views === "number" ? stats.total_views : 0,
    unique_visitors:
      typeof stats.unique_visitors === "number" ? stats.unique_visitors : 0,
    views_last_7_days:
      typeof stats.views_last_7_days === "number" ? stats.views_last_7_days : 0,
  };
}

export const PARENT_ENGAGEMENT_GOAL = 3;
