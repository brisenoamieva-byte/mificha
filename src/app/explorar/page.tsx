import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { fetchWeeklyCompetitionData } from "@/lib/ideal-xi";
import { fetchPublicDirectory } from "@/lib/public-directory";

export const metadata: Metadata = {
  title: "Explorar talento | MiFicha",
  description:
    "Directorio público de academias certificadas y jugadores con ficha verificada para visorías y scouts.",
};

export default async function ExplorarPage() {
  const [data, weeklyStats] = await Promise.all([
    fetchPublicDirectory(),
    fetchWeeklyCompetitionData(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader actionHref="/explorar" actionLabel="Explorar" />

      <main className="flex-1">
        <section className="border-b border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <p className="mf-section-kicker">Visorías y scouts</p>
            <h1 className="mt-2 mf-page-title">Explora talento verificado</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
              Marcador semanal, jugadores en tendencia, 11 ideal y rankings por
              posición. Compite por categoría, estado o ciudad.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/padres" className="mf-btn-secondary">
                Soy padre
              </Link>
              <Link href="/signup" className="mf-btn-primary">
                Soy academia
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
