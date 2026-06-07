import type { PlayerPosition } from "@/types/database";

export interface PublicAcademy {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  league_name: string | null;
  league_calendar_url: string | null;
  primary_color: string;
  is_certified: boolean;
}

export interface FeaturedPlayer {
  slug: string;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  passport_score: number;
  photo_url: string | null;
}

export interface PublicAcademyData {
  academy: PublicAcademy;
  stats: {
    totalPlayers: number;
    totalSeasons: number;
    totalMatches: number;
  };
  featuredPlayers: FeaturedPlayer[];
}

const PUBLIC_ACADEMY_SELECT =
  "id,name,slug,logo_url,description,city,state,phone,website,league_name,league_calendar_url,primary_color,is_certified";

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

  const academyResponse = await fetch(
    `${url}/rest/v1/academies?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=${PUBLIC_ACADEMY_SELECT}&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  if (!academyResponse.ok) return null;

  const academies = (await academyResponse.json()) as PublicAcademy[];
  const academy = academies[0];
  if (!academy) return null;

  const publicPlayerFilter = `academy_id=eq.${academy.id}&is_public=eq.true&public_consent_at=not.is.null`;

  const [totalPlayers, totalSeasons, totalMatches, playersResponse] =
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
        `${url}/rest/v1/players?${publicPlayerFilter}&select=slug,first_name,last_name,position,passport_score,photo_url&order=passport_score.desc&limit=12`,
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

  if (playersResponse.ok) {
    featuredPlayers = (await playersResponse.json()) as FeaturedPlayer[];
  }

  return {
    academy,
    stats: {
      totalPlayers,
      totalSeasons,
      totalMatches,
    },
    featuredPlayers,
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
  return `${base}/a/${slug}`;
}

export function formatWhatsAppUrl(phone: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const normalized = digits.startsWith("52") ? digits : `52${digits}`;
  return `https://wa.me/${normalized}`;
}
