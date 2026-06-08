import type { DirectoryAcademy } from "@/lib/public-directory";

export type ShowcaseAcademy = DirectoryAcademy;

export function prepareShowcaseAcademies(
  academies: DirectoryAcademy[],
): ShowcaseAcademy[] {
  return [...academies].sort((a, b) => {
    if (a.is_certified !== b.is_certified) {
      return a.is_certified ? -1 : 1;
    }

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
    certifiedCount: academies.filter((academy) => academy.is_certified).length,
    logoCount: academies.filter((academy) => academy.logo_url).length,
    playerCount,
  };
}

export function formatShowcaseLocation(academy: ShowcaseAcademy) {
  return [academy.city, academy.state].filter(Boolean).join(", ");
}
