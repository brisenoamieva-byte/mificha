import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";
import { MEXICO_STATES } from "@/lib/mexico-locations";
import { stateSlug } from "@/lib/viral-share";

type AcademyRow = { slug: string; created_at?: string | null };

async function fetchPublicAcademySlugs(): Promise<AcademyRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const response = await fetch(
      `${url}/rest/v1/academies?is_public=eq.true&select=slug,created_at&order=name.asc&limit=2000`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 3600 },
      },
    );
    if (!response.ok) return [];
    const json = (await response.json()) as AcademyRow[];
    return Array.isArray(json) ? json.filter((row) => Boolean(row.slug)) : [];
  } catch {
    return [];
  }
}

function entry(
  base: string,
  path: string,
  options?: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    lastModified?: Date | string;
  },
): MetadataRoute.Sitemap[number] {
  const item: MetadataRoute.Sitemap[number] = {
    url: `${base}${path}`,
    changeFrequency: options?.changeFrequency ?? "weekly",
    priority: options?.priority ?? 0.6,
  };
  // Solo incluir lastmod cuando es fecha real de contenido (no timestamp de build).
  if (options?.lastModified) {
    item.lastModified = options.lastModified;
  }
  return item;
}

/** Fechas reales de última edición editorial (actualizar al tocar legales). */
const LEGAL_LASTMOD = new Date("2026-11-06T00:00:00.000Z");
const VISORIAS_LASTMOD = new Date("2026-11-20T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl();

  const staticPages: MetadataRoute.Sitemap = [
    entry(base, "/fut", { priority: 1, changeFrequency: "daily" }),
    entry(base, "/fut/explorar", { priority: 0.9, changeFrequency: "daily" }),
    entry(base, "/fut/app", { priority: 0.8, changeFrequency: "monthly" }),
    entry(base, "/fut/visorias", {
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: VISORIAS_LASTMOD,
    }),
    entry(base, "/fut/noticias", { priority: 0.7 }),
    entry(base, "/fut/eventos", { priority: 0.7 }),
    entry(base, "/fut/convocatorias", { priority: 0.7 }),
    entry(base, "/fut/planes", { priority: 0.7 }),
    entry(base, "/fut/productos", { priority: 0.6 }),
    entry(base, "/fut/evaluaciones", { priority: 0.7 }),
    entry(base, "/fut/padres", { priority: 0.7 }),
    entry(base, "/fut/organizadores", { priority: 0.6 }),
    entry(base, "/fut/captacion", { priority: 0.6 }),
    entry(base, "/fut/mision", { priority: 0.5 }),
    entry(base, "/fut/talento", { priority: 0.8, changeFrequency: "daily" }),
    entry(base, "/fut/cracks", { priority: 0.7 }),
    entry(base, "/fut/pachuca", { priority: 0.6 }),
    entry(base, "/fut/gph", { priority: 0.6 }),
    entry(base, "/fut/gph-fun", { priority: 0.5 }),
    entry(base, "/fut/patrocinio", { priority: 0.4 }),
    entry(base, "/fut/aviso-privacidad", {
      priority: 0.3,
      changeFrequency: "yearly",
      lastModified: LEGAL_LASTMOD,
    }),
    entry(base, "/fut/terminos", {
      priority: 0.3,
      changeFrequency: "yearly",
      lastModified: LEGAL_LASTMOD,
    }),
    entry(base, "/fut/cookies", {
      priority: 0.2,
      changeFrequency: "yearly",
      lastModified: LEGAL_LASTMOD,
    }),
  ];

  const talentStates = MEXICO_STATES.map((state) =>
    entry(base, `/fut/talento/${stateSlug(state)}`, {
      priority: 0.7,
      changeFrequency: "daily",
    }),
  );

  const academies = await fetchPublicAcademySlugs();
  const academyPages = academies.map((academy) =>
    entry(base, `/fut/a/${academy.slug}`, {
      priority: 0.85,
      changeFrequency: "weekly",
      lastModified: academy.created_at
        ? new Date(academy.created_at)
        : undefined,
    }),
  );

  return [...staticPages, ...talentStates, ...academyPages];
}
