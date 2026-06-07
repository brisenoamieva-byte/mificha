import type { PlayerPosition } from "@/types/database";
import { locationMatches } from "@/lib/mexico-locations";
import { signPlayerPhotoUrl } from "@/lib/supabase-admin";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
  type PlayerCategoryFilter,
} from "@/lib/player-category";

export interface DirectoryAcademy {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  is_certified: boolean;
}

export interface DirectoryPlayer {
  slug: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: PlayerPosition;
  passport_score: number;
  photo_url: string | null;
  academies: {
    name: string;
    city: string | null;
    state: string | null;
    slug: string;
    is_certified: boolean;
  } | null;
}

export interface PublicDirectoryData {
  academies: DirectoryAcademy[];
  players: DirectoryPlayer[];
}

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

export async function fetchPublicDirectory(): Promise<PublicDirectoryData> {
  const { url, key } = getSupabaseHeaders();

  const [academiesResponse, playersResponse] = await Promise.all([
    fetch(
      `${url}/rest/v1/academies?is_public=eq.true&select=id,name,slug,city,state,logo_url,is_certified&order=name.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 60 },
      },
    ),
    fetch(
      `${url}/rest/v1/players?is_public=eq.true&is_discoverable=eq.true&public_consent_at=not.is.null&select=slug,first_name,last_name,birth_date,position,passport_score,photo_url,academies(name,city,state,slug,is_certified)&order=passport_score.desc&limit=500`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 60 },
      },
    ),
  ]);

  const academies = academiesResponse.ok
    ? ((await academiesResponse.json()) as DirectoryAcademy[])
    : [];

  const players = playersResponse.ok
    ? await Promise.all(
        ((await playersResponse.json()) as DirectoryPlayer[]).map(async (player) => ({
          ...player,
          photo_url: await signPlayerPhotoUrl(player.photo_url),
        })),
      )
    : [];

  return { academies, players };
}

export function parsePlayerSlugFromInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed) return "";

  try {
    if (trimmed.includes("://") || trimmed.startsWith("/j/")) {
      const path = trimmed.includes("://")
        ? new URL(trimmed).pathname
        : trimmed;
      const match = path.match(/\/j\/([^/?#]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
  } catch {
    // Fall through to slug parsing.
  }

  return trimmed
    .replace(/^\/j\//, "")
    .replace(/^\/+|\/+$/g, "")
    .split("?")[0]
    .split("#")[0];
}

export function filterDirectory(
  data: PublicDirectoryData,
  query: string,
  position: PlayerPosition | "all",
  minPassport: number,
  state = "",
  city = "",
  categoryFilter: PlayerCategoryFilter | string = "all",
) {
  const normalizedQuery = query.trim().toLowerCase();
  const category =
    typeof categoryFilter === "string"
      ? parseCategoryFilter(categoryFilter)
      : categoryFilter;

  const academies = data.academies.filter((academy) => {
    if (state && !locationMatches(academy.state, state)) return false;
    if (city && !locationMatches(academy.city, city)) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      academy.name,
      academy.city,
      academy.state,
      academy.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const players = data.players.filter((player) => {
    if (state && !locationMatches(player.academies?.state, state)) return false;
    if (city && !locationMatches(player.academies?.city, city)) return false;
    if (!matchesCategoryFilter(player.birth_date, category)) return false;
    if (position !== "all" && player.position !== position) return false;
    if (player.passport_score < minPassport) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      player.first_name,
      player.last_name,
      player.academies?.name,
      player.academies?.city,
      player.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return { academies, players };
}
