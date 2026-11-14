import {
  defaultAcademyCoverFallback,
  getAcademyCoverUrl,
} from "@/lib/academy-cover-store";
import { fetchLatestGphScoresByPlayerId } from "@/lib/gph-player-link";
import { GPH_LOGO } from "@/lib/gph-alliance";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { signPlayerPhotoUrl } from "@/lib/supabase-admin";
import type { PlayerPosition } from "@/types/database";

export interface PublicAcademy {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url?: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  address?: string | null;
  phone: string | null;
  website: string | null;
  league_name: string | null;
  league_calendar_url: string | null;
  primary_color: string;
  is_certified: boolean;
}

export interface FeaturedPlayer {
  id?: string;
  slug: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  passport_score: number;
  photo_url: string | null;
  has_gph_evaluation?: boolean;
  gph_global_score?: number | null;
}

export interface PublicAcademyData {
  academy: PublicAcademy;
  stats: {
    totalPlayers: number;
    totalSeasons: number;
    totalMatches: number;
  };
  featuredPlayers: FeaturedPlayer[];
  upcomingMatches: PublicScheduledMatch[];
}

export interface PublicScheduledMatch {
  id: string;
  opponent: string;
  match_date: string;
  kickoff_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  category: string | null;
  notes: string | null;
  status: "scheduled" | "postponed";
}

const PUBLIC_ACADEMY_SELECT =
  "id,name,slug,logo_url,cover_url,description,city,state,address,phone,website,league_name,league_calendar_url,primary_color,is_certified";

const PUBLIC_ACADEMY_SELECT_FALLBACK =
  "id,name,slug,logo_url,description,city,state,address,phone,website,league_name,league_calendar_url,primary_color,is_certified";

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

async function fetchCount(
  url: string,
  key: string,
  table: string,
  filter: string,
): Promise<number> {
  const response = await fetch(`${url}/rest/v1/${table}?${filter}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) return 0;

  const contentRange = response.headers.get("content-range");
  if (!contentRange) return 0;

  const total = contentRange.split("/")[1];
  return total ? Number.parseInt(total, 10) : 0;
}

export async function fetchPublicAcademyBySlug(
  slug: string,
): Promise<PublicAcademyData | null> {
  const { url, key } = getSupabaseHeaders();

  async function fetchAcademy(select: string) {
    return fetch(
      `${url}/rest/v1/academies?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=${select}&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 60 },
      },
    );
  }

  let academyResponse = await fetchAcademy(PUBLIC_ACADEMY_SELECT);
  if (!academyResponse.ok) {
    academyResponse = await fetchAcademy(PUBLIC_ACADEMY_SELECT_FALLBACK);
  }
  if (!academyResponse.ok) return null;

  const academies = (await academyResponse.json()) as PublicAcademy[];
  const academyRow = academies[0];
  if (!academyRow) return null;

  let coverUrl = academyRow.cover_url ?? null;
  try {
    const admin = createSupabaseAdminClient();
    coverUrl = await getAcademyCoverUrl(admin, academyRow.id, coverUrl);
  } catch {
    /* ops store unavailable */
  }
  if (!coverUrl) {
    coverUrl = defaultAcademyCoverFallback(academyRow.slug);
  }

  const academy: PublicAcademy = {
    ...academyRow,
    cover_url: coverUrl,
    address: academyRow.address ?? null,
    logo_url:
      academyRow.logo_url ||
      (academyRow.slug === "academia-gph" || academyRow.name.toLowerCase().includes("gph")
        ? GPH_LOGO
        : null),
  };

  const publicPlayerFilter = `academy_id=eq.${academy.id}&is_public=eq.true&public_consent_at=not.is.null`;

  const [totalPlayers, totalSeasons, totalMatches, playersResponse, scheduleResponse] =
    await Promise.all([
      fetchCount(url, key, "players", `${publicPlayerFilter}&select=id`),
      fetchCount(
        url,
        key,
        "seasons",
        `academy_id=eq.${academy.id}&select=id`,
      ),
      fetchCount(
        url,
        key,
        "matches",
        `academy_id=eq.${academy.id}&select=id`,
      ),
      fetch(
        `${url}/rest/v1/players?${publicPlayerFilter}&select=id,slug,first_name,last_name,position,passport_score,photo_url&order=passport_score.desc&limit=24`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      ),
      fetch(
        `${url}/rest/v1/matches?academy_id=eq.${academy.id}&status=in.(scheduled,postponed)&is_public=eq.true&select=id,opponent,match_date,kickoff_at,venue_name,venue_address,category,notes,status&order=kickoff_at.asc&limit=12`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          next: { revalidate: 60 },
        },
      ),
    ]);

  let featuredPlayers: FeaturedPlayer[] = [];
  let upcomingMatches: PublicScheduledMatch[] = [];

  if (playersResponse.ok) {
    const rows = (await playersResponse.json()) as FeaturedPlayer[];
    // Prioriza quienes ya tienen foto en el plantel destacado.
    const sorted = [...rows].sort((left, right) => {
      const leftPhoto = left.photo_url ? 1 : 0;
      const rightPhoto = right.photo_url ? 1 : 0;
      if (leftPhoto !== rightPhoto) return rightPhoto - leftPhoto;
      return (right.passport_score ?? 0) - (left.passport_score ?? 0);
    });
    const top = sorted.slice(0, 12);
    const gphScores = await fetchLatestGphScoresByPlayerId(
      top.map((player) => player.id).filter((id): id is string => Boolean(id)),
    );
    featuredPlayers = await Promise.all(
      top.map(async (player) => ({
        ...player,
        photo_url: await signPlayerPhotoUrl(player.photo_url),
        has_gph_evaluation: Boolean(player.id && gphScores.has(player.id)),
        gph_global_score:
          player.id && gphScores.has(player.id)
            ? (gphScores.get(player.id) ?? null)
            : null,
      })),
    );
  }

  if (scheduleResponse.ok) {
    upcomingMatches = (await scheduleResponse.json()) as PublicScheduledMatch[];
  }

  return {
    academy,
    stats: {
      totalPlayers,
      totalSeasons,
      totalMatches,
    },
    featuredPlayers,
    upcomingMatches,
  };
}

export function getPublicAcademyDescription(academy: PublicAcademy) {
  if (academy.description?.trim()) {
    return academy.description.trim();
  }

  const location = [academy.city, academy.state].filter(Boolean).join(", ");
  return location
    ? `${academy.name} · Academia de fútbol en ${location}.`
    : `${academy.name} · Academia de fútbol en MiFicha.`;
}

export function buildPublicAcademyUrl(slug: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://mificha.mx";
  return `${base}/fut/a/${slug}`;
}

export function formatWhatsAppUrl(phone: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const normalized = digits.startsWith("52") ? digits : `52${digits}`;
  return `https://wa.me/${normalized}`;
}
