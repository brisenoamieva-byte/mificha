import type { DirectoryAcademy } from "@/lib/public-directory";

export type ShowcaseAcademy = DirectoryAcademy;

export function prepareShowcaseAcademies(
  academies: DirectoryAcademy[],
): ShowcaseAcademy[] {
  return [...academies].sort((a, b) => {
    if (Boolean(a.logo_url) !== Boolean(b.logo_url)) {
      return a.logo_url ? -1 : 1;
    }

    return a.name.localeCompare(b.name, "es");
  });
}

export function getShowcaseStats(
  academies: ShowcaseAcademy[],
  playerCount = 0,
) {
  return {
    academyCount: academies.length,
    playerCount,
  };
}

export function formatShowcaseLocation(academy: ShowcaseAcademy) {
  return [academy.city, academy.state].filter(Boolean).join(", ");
}
