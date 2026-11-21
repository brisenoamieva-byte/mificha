import type { Metadata } from "next";
import { ExplorePageHero } from "@/components/marketing/explore-page-hero";
import { ExplorePaywallBanner } from "@/components/marketing/explore-paywall";
import { ExploreWithMap } from "@/components/marketing/explore-with-map";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { countExploreDirectoryAcademies, countExploreDirectoryPlayers } from "@/lib/explore-demo-data";
import {
  fetchPublicDirectory,
  sanitizeDirectoryForLockedView,
} from "@/lib/public-directory";
import { resolveExploreAccess } from "@/lib/scout-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { emptyTalentGeoHeat, fetchTalentGeoHeat } from "@/lib/talent-geo";
import { fetchTutorDirectoryPlayers } from "@/lib/tutor-directory";

export const metadata: Metadata = {
  title: "Explorar talento | MiFicha",
  description:
    "Buscador de jugadores con consentimiento. Filtra gratis; ficha completa con Explorar Pro (gratis por tiempo limitado).",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialQuery = firstParam(params.q);
  const initialPosition = firstParam(params.position);
  const initialState = firstParam(params.state);
  const initialCity = firstParam(params.city);
  const initialCategory = firstParam(params.category);

  const [data, tutorPlayers, access, heat] = await Promise.all([
    fetchPublicDirectory().catch(() => ({ academies: [], players: [] })),
    (async () => {
      try {
        const admin = createSupabaseAdminClient();
        return await fetchTutorDirectoryPlayers(admin);
      } catch {
        return [];
      }
    })(),
    resolveExploreAccess(),
    (async () => {
      try {
        const admin = createSupabaseAdminClient();
        return await fetchTalentGeoHeat(admin);
      } catch {
        return emptyTalentGeoHeat();
      }
    })(),
  ]);

  const academySlugs = new Set(data.players.map((player) => player.slug));
  const mergedPlayers = [
    ...data.players,
    ...tutorPlayers.filter((player) => !academySlugs.has(player.slug)),
  ];
  const fullDirectory = { ...data, players: mergedPlayers };
  const directory = access.unlocked
    ? fullDirectory
    : sanitizeDirectoryForLockedView(fullDirectory);

  const playerCount = countExploreDirectoryPlayers(fullDirectory);
  const academyCount = countExploreDirectoryAcademies(fullDirectory);
  // Por defecto: todos con consentimiento. El filtro Sub-X es opcional.
  const initialCategoryFilter = initialCategory || "all";

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Mis fichas" />

      <main className="flex-1">
        <ExplorePageHero playerCount={playerCount} academyCount={academyCount} />

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <ExplorePaywallBanner access={access} />
          <ExploreWithMap
            data={directory}
            heat={heat}
            initialCategoryFilter={initialCategoryFilter}
            unlocked={access.unlocked}
            initialQuery={initialQuery}
            initialPosition={initialPosition}
            initialState={initialState}
            initialCity={initialCity}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
