import Link from "next/link";
import { Check, Share2 } from "lucide-react";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { CURRENT_SEASON_LABEL } from "@/lib/marketing-season";
import {
  buildPlayerModeMissions,
  buildPlayerModeStats,
  type PlayerModeMission,
} from "@/lib/player-mode";
import type { TutorLinkedPerformance } from "@/lib/tutor-linked-performance";
import type { TutorChild, TutorMaterial, TutorSeasonStat } from "@/lib/tutor-family";
import { cn } from "@/lib/utils";

type MaterialWithUrl = TutorMaterial & { url: string | null };

function ageFromBirth(iso: string | null) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const birth = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 80 ? age : null;
}

function MissionRow({ mission }: { mission: PlayerModeMission }) {
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-2.5",
        mission.done ? "bg-emerald-50" : "bg-white/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          mission.done
            ? "bg-emerald-600 text-white"
            : "border border-mf-border bg-white text-transparent",
        )}
        aria-hidden
      >
        <Check className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            mission.done ? "text-emerald-900" : "text-mf-gph-ink",
          )}
        >
          {mission.label}
        </p>
        <p className="text-xs leading-5 text-mf-text-muted">{mission.hint}</p>
      </div>
    </li>
  );
}

export function PlayerModeCard({
  child,
  materials,
  seasons = [],
  performance = null,
  shareHref,
  className,
}: {
  child: TutorChild;
  materials: MaterialWithUrl[];
  seasons?: TutorSeasonStat[];
  performance?: TutorLinkedPerformance | null;
  shareHref?: string | null;
  className?: string;
}) {
  const profile = child.profile;
  const age = ageFromBirth(profile.birth_date);
  const photos = materials.filter((item) => item.kind === "photo" && item.url);
  const cover = (photos.find((item) => item.is_cover) ?? photos[0])?.url ?? null;
  const videos = materials.filter((item) => item.kind === "video" && item.url);
  const hasVideo = videos.length > 0;
  const position = profile.position?.trim() || "Posición por definir";
  const clubLine =
    [profile.club || profile.school, profile.city].filter(Boolean).join(" · ") ||
    "Arma tu club y ciudad";
  const stats = buildPlayerModeStats(seasons, performance);
  const missions = buildPlayerModeMissions(child, materials, seasons);
  const doneCount = missions.filter((m) => m.done).length;
  const hasAnyStat =
    stats.matches > 0 || stats.goals > 0 || stats.assists > 0 || stats.minutes > 0;
  const stageLabel = performance?.gph
    ? "Con evaluación GPH"
    : hasAnyStat
      ? "En temporada"
      : "Armando carta";

  return (
    <section className={cn("space-y-4", className)}>
      <article className="overflow-hidden rounded-3xl border border-mf-border bg-[#0a1f3d] text-white shadow-[0_28px_70px_-32px_rgba(8,24,48,0.65)]">
        <div className="relative grid gap-0 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative min-h-[280px] overflow-hidden bg-[#123d68] sm:min-h-[340px]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.25),transparent_45%)]">
                <p className="text-4xl font-semibold tracking-tight text-white/90">
                  {(child.player_name.trim()[0] || "J").toUpperCase()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                  Sube tu foto
                </p>
              </div>
            )}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1f3d] via-transparent to-transparent sm:bg-gradient-to-r"
              aria-hidden
            />
            {child.public_code ? (
              <p className="absolute left-3 top-3 rounded-md bg-black/45 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm">
                {child.public_code}
              </p>
            ) : null}
            {hasVideo ? (
              <p className="absolute bottom-3 left-3 rounded-md bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Con video
              </p>
            ) : null}
          </div>

          <div className="relative flex flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-accent-bright">
                Tu carta · <BrandWordmark className="text-white" />
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
                {child.player_name}
              </h1>
              <p className="mt-2 text-base font-semibold text-white/90">
                {position}
                {age != null ? ` · ${age} años` : ""}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <PlayerCategoryBadge
                  birthDate={profile.birth_date}
                  compact
                  className="bg-white/95 text-mf-gph-ink"
                />
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-mf-accent-bright ring-1 ring-white/15">
                  {stageLabel}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/70">{clubLine}</p>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {CURRENT_SEASON_LABEL}
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {(
                  [
                    ["PJ", stats.matches],
                    ["G", stats.goals],
                    ["A", stats.assists],
                    ["Min", stats.minutes],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/[0.08] px-2 py-2 text-center ring-1 ring-white/10"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                      {label}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {!hasAnyStat ? (
                <p className="mt-2 text-xs leading-5 text-white/55">
                  Cuando cargues partidos o goles, aquí se encienden tus números.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <div className="rounded-2xl border border-mf-border bg-mf-canvas px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Misiones de carta
            </p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              {doneCount}/{missions.length} listas · cada una hace más fuerte tu ficha
            </p>
          </div>
          {shareHref ? (
            <Link
              href={shareHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-mf-gph hover:underline"
            >
              <Share2 className="h-4 w-4" />
              Compartir carta
            </Link>
          ) : null}
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {missions.map((mission) => (
            <MissionRow key={mission.id} mission={mission} />
          ))}
        </ul>
      </div>
    </section>
  );
}
