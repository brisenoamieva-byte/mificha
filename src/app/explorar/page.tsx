import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { ExploreHeroAside } from "@/components/marketing/explore-hero-aside";
import { PublicScheduleExploreSection } from "@/components/marketing/public-schedule-explore-section";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { fetchWeeklyCompetitionData } from "@/lib/ideal-xi";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";
import { fetchPublicDirectory } from "@/lib/public-directory";
import { fetchPublicUpcomingMatches } from "@/lib/public-schedule";

export const metadata: Metadata = {
  title: "Explorar talento | MiFicha",
  description:
    "Directorio público de academias certificadas y jugadores con ficha verificada para visorías y scouts.",
};

export default async function ExplorarPage() {
  const [data, weeklyStats, upcomingMatches] = await Promise.all([
    fetchPublicDirectory(),
    fetchWeeklyCompetitionData(),
    fetchPublicUpcomingMatches(),
  ]);

  const playerCount = data.players.length;
  const academyCount = data.academies.length;

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/explorar" actionLabel="Explorar" />

      <main className="flex-1">
        <MarketingPageHero
          eyebrow="Visorías y scouts"
          title="Explora talento verificado en México"
          description="Marcador semanal, jugadores en tendencia, 11 ideal y rankings por posición. Filtra por categoría, estado o ciudad."
          photoSrc={MARKETING_IMAGES.heroExplorar}
          photoAlt="Partido escolar visto desde la banda en torneo intercolegial"
          actions={
            <>
              <Link href="/padres" className="mf-btn-secondary">
                Soy padre
              </Link>
              <Link href="/signup" className="mf-btn-primary">
                Soy academia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          }
          stats={[
            { value: String(playerCount), label: "Jugadores públicos" },
            { value: String(academyCount), label: "Academias" },
            { value: "11", label: "Ideal semanal" },
          ]}
          aside={<ExploreHeroAside />}
        />

        <PublicScheduleExploreSection matches={upcomingMatches} />

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <ExploreDirectory
            data={data}
            weeklyPerformances={weeklyStats.performances}
            rankedPerformances={weeklyStats.ranked}
            risingPerformances={weeklyStats.rising}
            leaderboard={weeklyStats.leaderboard}
            weekLabel={weeklyStats.weekLabel}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
