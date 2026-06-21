import type { MatchPerformanceRow } from "@/lib/performance-analytics";
import { PositionFieldMark } from "@/components/ui/position-field-mark";
import { ProfileRadarChart } from "@/components/ui/profile-radar-chart";
import {
  buildCoachRadarSeries,
  buildVerifiedRadarSeries,
  computeParticipationBreakdown,
  hasCoachVisualProfile,
  TRAIT_LABELS,
  VERIFIED_RADAR_LABELS,
} from "@/lib/player-visual-profile";
import type { Player, PlayerSeasonStat } from "@/types/database";

interface PublicPlayerVisualProfileSectionProps {
  player: Player;
  currentSeasonStats: PlayerSeasonStat | null;
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
  seasonProgress,
}: PublicPlayerVisualProfileSectionProps) {
  const participation = computeParticipationBreakdown(seasonProgress);
  const coachSeries = buildCoachRadarSeries(player);
  const verifiedSeries = buildVerifiedRadarSeries(currentSeasonStats);
  const showCoach = hasCoachVisualProfile(player);
  const showVerified = (currentSeasonStats?.total_matches ?? 0) > 0 || seasonProgress.length > 0;

  if (!showCoach && !showVerified && participation.total === 0) {
    return null;
  }

  const coachAxes = Object.values(TRAIT_LABELS);

  return (
    <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Perfil visual</h2>
          <p className="mt-1 text-sm text-slate-500">
            Stats del acta y evaluación de la academia, en capas separadas.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <PositionFieldMark
            primary={player.position}
            secondary={player.secondary_position}
          />

          {participation.total > 0 ? (
            <div>
              <p className="text-sm font-semibold text-slate-900">Participación en jornadas</p>
              <p className="mt-1 text-xs text-slate-500">Calculado desde minutos del acta oficial.</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <ParticipationTile label="Titular (45+ min)" value={participation.starts} />
                <ParticipationTile label="Suplente" value={participation.subs} />
                <ParticipationTile label="Sin minutos" value={participation.noMinutes} />
              </div>
            </div>
          ) : null}

          {player.coach_notes?.trim() ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Observaciones del entrenador
              </p>
              <p className="mt-2 text-sm leading-7 text-amber-950">{player.coach_notes}</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {showVerified ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <p className="text-sm font-semibold text-emerald-900">Del acta oficial</p>
              <p className="mt-1 text-xs text-emerald-800/80">Verificado · torneo</p>
              <ProfileRadarChart
                axes={VERIFIED_RADAR_LABELS}
                series={[verifiedSeries]}
                className="mt-4"
                size={200}
              />
            </div>
          ) : null}

          {showCoach && coachSeries ? (
            <div className="rounded-xl border border-[#1B4F8C]/15 bg-[#1B4F8C]/5 p-4">
              <p className="text-sm font-semibold text-[#1B4F8C]">De la academia</p>
              <p className="mt-1 text-xs text-slate-500">Evaluación del cuerpo técnico</p>
              <ProfileRadarChart
                axes={coachAxes}
                series={[coachSeries]}
                className="mt-4"
                size={200}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
