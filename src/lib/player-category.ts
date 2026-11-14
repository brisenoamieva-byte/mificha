export type PlayerCategoryFilter =
  | { kind: "all" }
  | { kind: "age"; age: number }
  | { kind: "adult" }
  | { kind: "generation"; year: number };

/** Sub-X solo para cantera. A partir de 20 se muestra «Mayor», no Sub-25. */
export const YOUTH_SUB_MIN_AGE = 4;
export const YOUTH_SUB_MAX_AGE = 19;

export function isYouthSubAge(age: number) {
  return age >= YOUTH_SUB_MIN_AGE && age <= YOUTH_SUB_MAX_AGE;
}

export interface CategoryFilterOption {
  value: string;
  label: string;
  group?: "age" | "generation";
}

/** Fecha provisional al importar sin natalicio; la UI la trata como «sin fecha». */
export const UNKNOWN_BIRTH_DATE = "1900-01-01";

export function isUnknownBirthDate(birthDate: string | null | undefined) {
  return !birthDate || birthDate === UNKNOWN_BIRTH_DATE;
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
  if (!Number.isFinite(age) || age < YOUTH_SUB_MIN_AGE) return "Sin categoría";
  if (age > YOUTH_SUB_MAX_AGE) return "Mayor";
  return `Sub-${age}`;
}

export function getCategoryOptionLabel(age: number): string {
  if (!isYouthSubAge(age)) return "Mayor";
  return `Sub-${age} · ${age} años`;
}

export function getGenerationLabel(year: number): string {
  return `Generación ${year}`;
}

export function formatPlayerCategory(birthDate: string | null | undefined): string {
  if (isUnknownBirthDate(birthDate)) return "Sin categoría";
  const age = getPlayerAge(birthDate!);
  if (!isYouthSubAge(age)) {
    if (age > YOUTH_SUB_MAX_AGE) {
      return `Mayor · ${getGenerationLabel(getPlayerGeneration(birthDate!))}`;
    }
    return "Sin categoría";
  }
  return `${getSubCategoryLabel(age)} · ${getGenerationLabel(getPlayerGeneration(birthDate!))}`;
}

export function parseCategoryFilter(value: string): PlayerCategoryFilter {
  if (!value || value === "all") return { kind: "all" };
  if (value === "age:adult") return { kind: "adult" };
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
  if (filter.kind === "adult") return "age:adult";
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
  if (filter.kind === "adult") {
    return getPlayerAge(birthDate) > YOUTH_SUB_MAX_AGE;
  }

  return getPlayerGeneration(birthDate) === filter.year;
}

export function getCategoryFilterLabel(filter: PlayerCategoryFilter): string | null {
  if (filter.kind === "all") return null;
  if (filter.kind === "age") return getCategoryOptionLabel(filter.age);
  if (filter.kind === "adult") return "Mayor";
  return getGenerationLabel(filter.year);
}

export function buildCategoryFilterOptions(
  birthDates: Array<string | null | undefined>,
  options: { includeAll?: boolean } = {},
): CategoryFilterOption[] {
  const { includeAll = true } = options;
  const ages = new Set<number>();
  const generations = new Set<number>();
  let hasAdult = false;

  for (const birthDate of birthDates) {
    if (isUnknownBirthDate(birthDate)) continue;
    const age = getPlayerAge(birthDate!);
    if (isYouthSubAge(age)) ages.add(age);
    else if (age > YOUTH_SUB_MAX_AGE) hasAdult = true;
    generations.add(getPlayerGeneration(birthDate!));
  }

  const filterOptions: CategoryFilterOption[] = [];

  if (includeAll) {
    filterOptions.push({ value: "all", label: "Todas las categorías" });
  }

  for (const age of [...ages].sort((a, b) => a - b)) {
    filterOptions.push({
      value: `age:${age}`,
      label: getCategoryOptionLabel(age),
      group: "age",
    });
  }
  if (hasAdult) {
    filterOptions.push({
      value: "age:adult",
      label: "Mayor",
      group: "age",
    });
  }

  for (const year of [...generations].sort((a, b) => b - a)) {
    filterOptions.push({
      value: `gen:${year}`,
      label: getGenerationLabel(year),
      group: "generation",
    });
  }

  return filterOptions;
}

/** Most common Sub-X in the dataset — used as default for competitive views. */
export function getDefaultCategoryFilter(
  birthDates: Array<string | null | undefined>,
): string {
  const ageCounts = new Map<number, number>();

  for (const birthDate of birthDates) {
    if (isUnknownBirthDate(birthDate)) continue;
    const age = getPlayerAge(birthDate!);
    if (!isYouthSubAge(age)) continue;
    ageCounts.set(age, (ageCounts.get(age) ?? 0) + 1);
  }

  if (ageCounts.size === 0) return "all";

  const [topAge] = [...ageCounts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0] - right[0],
  )[0];

  return serializeCategoryFilter({ kind: "age", age: topAge });
}

export function isCompetitionCategoryFilter(value: string): boolean {
  return parseCategoryFilter(value).kind !== "all";
}

/** Parse "Sub-15 Varonil" style labels from scheduled matches. */
export function parseMatchCategoryAge(
  category: string | null | undefined,
): number | null {
  if (!category?.trim()) return null;

  const subMatch = category.match(/sub[\s-]?(\d{1,2})/i);
  if (subMatch) {
    const age = Number(subMatch[1]);
    return Number.isFinite(age) ? age : null;
  }

  return null;
}

export function inferCategoryFilterFromMatchCategory(
  category: string | null | undefined,
): string | null {
  const age = parseMatchCategoryAge(category);
  if (age == null) return null;
  return serializeCategoryFilter({ kind: "age", age });
}

export function buildMatchCategoryFilterOptions(
  categories: Array<string | null | undefined>,
): CategoryFilterOption[] {
  const unique = [
    ...new Set(
      categories
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "es"));

  const options: CategoryFilterOption[] = [
    { value: "all", label: "Todas las categorías del calendario" },
  ];

  for (const label of unique) {
    options.push({ value: label, label, group: "age" });
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
