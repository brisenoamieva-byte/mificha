import type { SupabaseClient } from "@supabase/supabase-js";
import {
  resolveCityPoint,
  resolveStateCentroid,
} from "@/lib/mexico-geo-points";
import {
  resolveStateName,
  resolveTutorLocation,
} from "@/lib/mexico-locations";
import type { TutorChild } from "@/lib/tutor-family";

const OPS_BUCKET = "mificha-ops";
const ROSTER = "families/roster.json";

export type TalentGeoCityBucket = {
  city: string;
  state: string;
  count: number;
  lat: number;
  lng: number;
};

export type TalentGeoStateBucket = {
  state: string;
  count: number;
  lat: number;
  lng: number;
};

export type TalentGeoHeat = {
  totalWithLocation: number;
  totalFichas: number;
  stateCount: number;
  cityCount: number;
  states: TalentGeoStateBucket[];
  cities: TalentGeoCityBucket[];
  generatedAt: string;
};

async function readRoster(admin: SupabaseClient): Promise<TutorChild[]> {
  const { data, error } = await admin.storage
    .from(OPS_BUCKET)
    .download(ROSTER, { cacheNonce: String(Date.now()) }, { cache: "no-store" });
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as TutorChild[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Mapa de calor agregado (sin PII): conteos por ciudad/estado del roster persona.
 * Incluye fichas privadas — solo buckets anónimos para engagement en Explorar.
 */
export async function fetchTalentGeoHeat(
  admin: SupabaseClient,
): Promise<TalentGeoHeat> {
  const roster = await readRoster(admin);
  const stateMap = new Map<string, TalentGeoStateBucket>();
  const cityMap = new Map<string, TalentGeoCityBucket>();
  let withLocation = 0;

  for (const child of roster) {
    let { state: stateName, city: cityName } = resolveTutorLocation(
      child.profile?.state,
      child.profile?.city,
    );
    cityName = cityName.trim();
    stateName = stateName.trim();

    // A veces guardan el estado en el campo ciudad.
    if (!stateName && cityName) {
      const asState = resolveStateName(cityName);
      if (asState) {
        stateName = asState;
        cityName = asState;
      }
    }

    if (!stateName && !cityName) continue;
    if (/^otra$/i.test(cityName) || /^otro$/i.test(cityName)) continue;
    withLocation += 1;

    if (stateName) {
      const centroid = resolveStateCentroid(stateName);
      if (centroid) {
        const key = centroid.name;
        const prev = stateMap.get(key);
        if (prev) prev.count += 1;
        else {
          stateMap.set(key, {
            state: key,
            count: 1,
            lat: centroid.lat,
            lng: centroid.lng,
          });
        }
      }
    }

    if (cityName && stateName) {
      const point = resolveCityPoint(cityName, stateName);
      if (point) {
        const key = `${stateName}::${point.name}`;
        const prev = cityMap.get(key);
        if (prev) prev.count += 1;
        else {
          cityMap.set(key, {
            city: point.name,
            state: stateName,
            count: 1,
            lat: point.lat,
            lng: point.lng,
          });
        }
      }
    }
  }

  const states = [...stateMap.values()].sort((a, b) => b.count - a.count);
  const cities = [...cityMap.values()].sort((a, b) => b.count - a.count);

  return {
    totalWithLocation: withLocation,
    totalFichas: roster.length,
    stateCount: states.length,
    cityCount: cities.length,
    states,
    cities: cities.slice(0, 80),
    generatedAt: new Date().toISOString(),
  };
}

export function emptyTalentGeoHeat(): TalentGeoHeat {
  return {
    totalWithLocation: 0,
    totalFichas: 0,
    stateCount: 0,
    cityCount: 0,
    states: [],
    cities: [],
    generatedAt: new Date().toISOString(),
  };
}
