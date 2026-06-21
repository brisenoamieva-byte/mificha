import Link from "next/link";
import { PlayerPortraitThumb } from "@/components/ui/player-portrait-image";
import { DEMO_EXPLORE_FEATURED } from "@/lib/explore-demo-data";
import { getPositionLabel } from "@/lib/dashboard-utils";

export function ExploreHeroAside() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-2xl bg-[radial-gradient(circle,rgba(52,211,153,0.1)_0%,rgba(27,79,140,0.05)_60%,transparent_75%)] blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-mf-border bg-mf-surface shadow-[0_24px_48px_-12px_rgba(15,45,82,0.18)]">
        <div className="border-b border-mf-border-subtle px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
            Temporada 2026
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-mf-text">
            Destacados de la jornada
          </p>
        </div>
        <ul className="divide-y divide-mf-border-subtle">
          {DEMO_EXPLORE_FEATURED.map((player) => (
            <li key={player.name}>
              <Link
                href={player.href}
                className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-mf-canvas/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={
                      player.rank === 1
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mf-accent text-xs font-bold text-slate-950"
                        : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-bold text-mf-brand"
                    }
                  >
                    {player.rank}
                  </span>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                    <PlayerPortraitThumb src={player.photo} alt="" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-mf-text">{player.name}</p>
                    <p className="truncate text-xs text-mf-text-muted">
                      {getPositionLabel(player.position)} · Querétaro
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-mf-brand">{player.stat}</p>
                  <p className="text-[10px] text-mf-text-muted">Stats del torneo</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
