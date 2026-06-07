import locationsData from "@/data/mexico-locations.json";

export type MexicoLocationsMap = Record<string, string[]>;

export const MEXICO_LOCATIONS = locationsData as MexicoLocationsMap;

export const MEXICO_STATES = Object.keys(MEXICO_LOCATIONS).sort((a, b) =>
  a.localeCompare(b, "es"),
);

export function getMunicipalitiesForState(state: string): string[] {
  return MEXICO_LOCATIONS[state] ?? [];
}

export function normalizeLocation(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function locationMatches(
  stored: string | null | undefined,
  selected: string,
): boolean {
  if (!stored || !selected) return false;
  return normalizeLocation(stored) === normalizeLocation(selected);
}

export function resolveStateName(input: string | null | undefined): string {
  if (!input?.trim()) return "";

  const normalized = normalizeLocation(input);
  return (
    MEXICO_STATES.find((state) => normalizeLocation(state) === normalized) ?? ""
  );
}

export function resolveMunicipalityName(
  state: string,
  input: string | null | undefined,
): string {
  if (!state || !input?.trim()) return "";

  const normalized = normalizeLocation(input);
  return (
    getMunicipalitiesForState(state).find(
      (municipality) => normalizeLocation(municipality) === normalized,
    ) ?? ""
  );
}
