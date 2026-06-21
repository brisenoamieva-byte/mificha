import type { MatchPerformanceRow } from "@/lib/performance-analytics";
import { FichaCoachBlock, hasFichaCoachContent } from "@/components/ficha/ficha-coach-block";
import { FichaSeasonBlock } from "@/components/ficha/ficha-season-block";
import { FICHA_COPY } from "@/lib/ficha-content";
import { computeParticipationBreakdown } from "@/lib/player-visual-profile";
import type { Player, PlayerSeasonStat } from "@/types/database";

interface PublicPlayerVisualProfileSectionProps {
  player: Player;
  currentSeasonStats: PlayerSeasonStat | null;
  currentSeasonName?: string | null;
  seasonProgress: MatchPerformanceRow[];
}

function ParticipationTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <p className="text-2xl font-semibold tabular-nums text-[#1B4F8C]">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function PublicPlayerVisualProfileSection({
  player,
  currentSeasonStats,
  currentSeasonName,
  seasonProgress,
}: PublicPlayerVisualProfileSectionProps) {
  const participation = computeParticipationBreakdown(seasonProgress);
  const showCoach = hasFichaCoachContent(player);
  const showSeason =
    (currentSeasonStats?.total_matches ?? 0) > 0 || seasonProgress.length > 0;

  if (!showCoach && !showSeason && participation.total === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Ficha técnica</h2>
        <p className="mt-1 text-sm text-slate-500">
          Stats del torneo y evaluación de la academia, por separado.
        </p>
      </div>

      {showSeason ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {currentSeasonName ? (
            <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500 sm:px-5">
              {currentSeasonName}
            </p>
          ) : null}
          <FichaSeasonBlock stats={currentSeasonStats} />
        </div>
      ) : null}

      {participation.total > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-900">{FICHA_COPY.role}</p>
          <p className="mt-1 text-xs text-slate-500">Según minutos registrados en cada jornada.</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <ParticipationTile label="Titular (45+ min)" value={participation.starts} />
            <ParticipationTile label="Suplente" value={participation.subs} />
            <ParticipationTile label="Sin minutos" value={participation.noMinutes} />
          </div>
        </div>
      ) : null}

      {showCoach ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <FichaCoachBlock
            primary={player.position}
            secondary={player.secondary_position}
            traits={{
              technical: player.trait_technical,
              tactical: player.trait_tactical,
              physical: player.trait_physical,
              attitude: player.trait_attitude,
            }}
            coachNotes={player.coach_notes}
          />
        </div>
      ) : null}
    </section>
  );
}
