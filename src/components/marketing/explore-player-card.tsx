import Link from "next/link";
import { Film, Lock, MapPin, ShieldCheck } from "lucide-react";
import { GphEvaluationBadge } from "@/components/ui/gph-evaluation-badge";
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
  /** Si false, solo info básica (sin foto nítida / stats / video). */
  unlocked?: boolean;
};

export function ExplorePlayerCard({
  player,
  className,
  unlocked = true,
}: ExplorePlayerCardProps) {
  const demo = isExploreDemoPlayer(player);
  const isTutor = !demo && player.source === "tutor";
  const fullName = `${player.first_name} ${player.last_name}`.trim();
  const basicName = unlocked
    ? fullName
    : `${player.first_name} ${(player.last_name?.[0] ?? "").toUpperCase()}.`.trim();
  const href = demo
    ? player.example_href
    : isTutor && player.public_code
      ? `/fut/f/${player.public_code}`
      : `/fut/j/${player.slug}`;
  const stats =
    unlocked && player.season_stats
      ? player.season_stats
      : null;
  const showStats =
    stats &&
    (stats.matches > 0 ||
      stats.goals > 0 ||
      stats.assists > 0 ||
      stats.minutes > 0);
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
        {unlocked && player.photo_url ? (
          <PlayerPortraitImage
            src={player.photo_url}
            alt={`Retrato de ${fullName}`}
            className="transition duration-300 group-hover:scale-[1.03]"
            sizes="72px"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm font-semibold text-mf-text-muted">
            <span>
              {player.first_name[0]}
              {player.last_name[0]}
            </span>
            {!unlocked ? <Lock className="h-3.5 w-3.5 text-mf-gph" aria-hidden /> : null}
          </div>
        )}

        {demo ? (
          <span className="absolute left-1 top-1 rounded bg-white/95 px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-mf-brand shadow-sm">
            Ejemplo
          </span>
        ) : null}
        {!unlocked ? (
          <span className="absolute bottom-1 left-1 rounded bg-mf-gph px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-white">
            Básico
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-mf-text sm:text-[15px]">
              {basicName}
            </p>
            <p className="mt-0.5 text-xs text-mf-text-secondary">
              {getPositionLabel(player.position)}
              {isTutor && player.public_code ? (
                <span className="font-mono text-mf-gph"> · {player.public_code}</span>
              ) : null}
            </p>
          </div>
          <PlayerCategoryBadge
            birthDate={player.birth_date}
            compact
            className="shrink-0"
          />
        </div>

        {showStats && stats ? (
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
          <p className="mt-2 text-xs text-mf-text-muted">
            {unlocked ? CURRENT_SEASON_LABEL : "Detalle con membresía persona"}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          {isTutor ? (
            <span className="inline-flex items-center gap-1 font-medium text-mf-gph">
              <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
              Ficha jugador
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
              <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
              Verificada
            </span>
          )}
          {unlocked && player.has_gph_evaluation ? (
            <GphEvaluationBadge asSpan score={player.gph_global_score} />
          ) : null}
          {unlocked && player.video_url ? (
            <span className="inline-flex items-center gap-1 font-medium text-violet-700">
              <Film className="h-3 w-3 shrink-0" aria-hidden />
              Video
            </span>
          ) : null}
          <span className="truncate text-mf-text-muted">
            {unlocked
              ? (player.academies?.name ?? (isTutor ? "Por el tutor" : "Academia"))
              : (player.academies?.city || player.academies?.state || "México")}
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
