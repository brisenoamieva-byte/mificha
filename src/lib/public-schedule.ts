import type { PublicScheduledMatch } from "@/lib/public-academy";

function getSupabaseHeaders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, key };
}

export interface PublicUpcomingMatch extends PublicScheduledMatch {
  academy_name: string;
  academy_slug: string;
  academy_primary_color: string;
}

export async function fetchPublicUpcomingMatches(
  limit = 24,
): Promise<PublicUpcomingMatch[]> {
  const { url, key } = getSupabaseHeaders();
  const now = new Date().toISOString();

  const matchesResponse = await fetch(
    `${url}/rest/v1/matches?status=in.(scheduled,postponed)&is_public=eq.true&kickoff_at=gte.${encodeURIComponent(now)}&select=id,opponent,match_date,kickoff_at,venue_name,venue_address,category,notes,status,academy_id&order=kickoff_at.asc&limit=${limit}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  if (!matchesResponse.ok) return [];

  const matches = (await matchesResponse.json()) as Array<
    PublicScheduledMatch & { academy_id: string }
  >;

  if (matches.length === 0) return [];

  const academyIds = [...new Set(matches.map((match) => match.academy_id))];
  const academiesResponse = await fetch(
    `${url}/rest/v1/academies?id=in.(${academyIds.join(",")})&is_public=eq.true&select=id,name,slug,primary_color`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      next: { revalidate: 60 },
    },
  );

  if (!academiesResponse.ok) return [];

  const academies = (await academiesResponse.json()) as Array<{
    id: string;
    name: string;
    slug: string;
    primary_color: string;
  }>;

  const academyMap = new Map(academies.map((academy) => [academy.id, academy]));

  return matches
    .map((match) => {
      const academy = academyMap.get(match.academy_id);
      if (!academy) return null;

      return {
        id: match.id,
        opponent: match.opponent,
        match_date: match.match_date,
        kickoff_at: match.kickoff_at,
        venue_name: match.venue_name,
        venue_address: match.venue_address,
        category: match.category,
        notes: match.notes,
        status: match.status,
        academy_name: academy.name,
        academy_slug: academy.slug,
        academy_primary_color: academy.primary_color,
      };
    })
    .filter((match): match is PublicUpcomingMatch => match !== null);
}
