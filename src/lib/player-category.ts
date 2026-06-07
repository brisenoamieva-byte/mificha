export type PlayerCategoryFilter =
  | { kind: "all" }
  | { kind: "age"; age: number }
  | { kind: "generation"; year: number };

export interface CategoryFilterOption {
  value: string;
  label: string;
  group?: "age" | "generation";
}

const MEXICO_TIMEZONE = "America/Mexico_City";

export function getPlayerAge(birthDate: string, reference = new Date()): number {
  const refStr = reference.toLocaleDateString("en-CA", {
    timeZone: MEXICO_TIMEZONE,
  });
  const birthStr = birthDate.slice(0, 10);

  const ref = new Date(`${refStr}T12:00:00`);
  const birth = new Date(`${birthStr}T12:00:00`);

  let age = ref.getFullYear() - birth.getFullYear();
  const refMonth = ref.getMonth();
  const birthMonth = birth.getMonth();

  if (
    refMonth < birthMonth ||
    (refMonth === birthMonth && ref.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

export function getPlayerGeneration(birthDate: string): number {
  return Number(birthDate.slice(0, 4));
}

export function getSubCategoryLabel(age: number): string {
  return `Sub-${age}`;
}

export function getCategoryOptionLabel(age: number): string {
  return `Sub-${age} · ${age} años`;
}

export function getGenerationLabel(year: number): string {
  return `Generación ${year}`;
}

export function formatPlayerCategory(birthDate: string): string {
  const age = getPlayerAge(birthDate);
  return `${getSubCategoryLabel(age)} · ${getGenerationLabel(getPlayerGeneration(birthDate))}`;
}

export function parseCategoryFilter(value: string): PlayerCategoryFilter {
  if (!value || value === "all") return { kind: "all" };
  if (value.startsWith("age:")) {
    const age = Number(value.slice(4));
    return Number.isFinite(age) ? { kind: "age", age } : { kind: "all" };
  }
  if (value.startsWith("gen:")) {
    const year = Number(value.slice(4));
    return Number.isFinite(year) ? { kind: "generation", year } : { kind: "all" };
  }
  return { kind: "all" };
}

export function serializeCategoryFilter(filter: PlayerCategoryFilter): string {
  if (filter.kind === "age") return `age:${filter.age}`;
  if (filter.kind === "generation") return `gen:${filter.year}`;
  return "all";
}

export function matchesCategoryFilter(
  birthDate: string | null | undefined,
  filter: PlayerCategoryFilter,
): boolean {
  if (filter.kind === "all") return true;
  if (!birthDate) return false;

  if (filter.kind === "age") {
    return getPlayerAge(birthDate) === filter.age;
  }

  return getPlayerGeneration(birthDate) === filter.year;
}

export function getCategoryFilterLabel(filter: PlayerCategoryFilter): string | null {
  if (filter.kind === "all") return null;
  if (filter.kind === "age") return getCategoryOptionLabel(filter.age);
  return getGenerationLabel(filter.year);
}

export function buildCategoryFilterOptions(
  birthDates: Array<string | null | undefined>,
): CategoryFilterOption[] {
  const ages = new Set<number>();
  const generations = new Set<number>();

  for (const birthDate of birthDates) {
    if (!birthDate) continue;
    ages.add(getPlayerAge(birthDate));
    generations.add(getPlayerGeneration(birthDate));
  }

  const options: CategoryFilterOption[] = [
    { value: "all", label: "Todas las categorías" },
  ];

  for (const age of [...ages].sort((a, b) => a - b)) {
    options.push({
      value: `age:${age}`,
      label: getCategoryOptionLabel(age),
      group: "age",
    });
  }

  for (const year of [...generations].sort((a, b) => b - a)) {
    options.push({
      value: `gen:${year}`,
      label: getGenerationLabel(year),
      group: "generation",
    });
  }

  return options;
}

export function collectBirthDatesFromDirectory(
  players: Array<{ birth_date?: string | null }>,
  performances: Array<{ birth_date?: string | null }> = [],
): string[] {
  const dates: string[] = [];

  for (const player of players) {
    if (player.birth_date) dates.push(player.birth_date);
  }

  for (const performance of performances) {
    if (performance.birth_date) dates.push(performance.birth_date);
  }

  return dates;
}
