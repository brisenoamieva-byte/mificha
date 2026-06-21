import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { PlayerPortraitImage } from "@/components/ui/player-portrait-image";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  isExploreDemoPlayer,
  type ExploreDemoPlayer,
} from "@/lib/explore-demo-data";
import type { DirectoryPlayer } from "@/lib/public-directory";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import { cn } from "@/lib/utils";

type ExplorePlayerCardProps = {
  player: DirectoryPlayer | ExploreDemoPlayer;
  className?: string;
};

export function ExplorePlayerCard({ player, className }: ExplorePlayerCardProps) {
  const demo = isExploreDemoPlayer(player);
  const fullName = `${player.first_name} ${player.last_name}`;
  const href = demo ? player.example_href : `/j/${player.slug}`;
  const stats = demo ? player.season_stats : null;
  const location = [player.academies?.city, player.academies?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={href}
      className={cn(
        "group flex gap-3 overflow-hidden rounded-xl border border-mf-border bg-white p-3 transition hover:border-mf-brand/35 hover:shadow-[0_8px_24px_-16px_rgba(15,45,82,0.25)] sm:gap-3.5 sm:p-3.5",
        className,
      )}
    >
      <div className="relative h-[88px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-mf-canvas sm:h-[96px] sm:w-[72px]">
        {player.photo_url ? (
          <PlayerPortraitImage
            src={player.photo_url}
            alt={`Retrato de ${fullName}`}
            className="transition duration-300 group-hover:scale-[1.03]"
            sizes="72px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-mf-text-muted">
            {player.first_name[0]}
            {player.last_name[0]}
          </div>
        )}

        {demo ? (
          <span className="absolute left-1 top-1 rounded bg-white/95 px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-mf-brand shadow-sm">
            Ejemplo
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-mf-text sm:text-[15px]">
              {fullName}
            </p>
            <p className="mt-0.5 text-xs text-mf-text-secondary">
              {getPositionLabel(player.position)}
            </p>
          </div>
          <PlayerCategoryBadge birthDate={player.birth_date} compact />
        </div>

        {stats ? (
          <p className="mt-2 text-xs tabular-nums text-mf-text-secondary">
            <span className="font-semibold text-mf-text">{stats.matches}</span> PJ
            {" · "}
            <span className="font-semibold text-mf-text">{stats.goals}</span> G
            {" · "}
            <span className="font-semibold text-mf-text">{stats.assists}</span> A
            {" · "}
            <span className="font-semibold text-mf-text">{stats.minutes}</span> min
          </p>
        ) : (
          <p className="mt-2 text-xs text-mf-text-muted">{CURRENT_SEASON_LABEL}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
            <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
            Verificada
          </span>
          <span className="truncate text-mf-text-muted">
            {player.academies?.name ?? "Academia"}
          </span>
          {location ? (
            <span className="inline-flex items-center gap-0.5 text-mf-text-muted">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              {location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
