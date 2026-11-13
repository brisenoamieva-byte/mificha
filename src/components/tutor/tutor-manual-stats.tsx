import {
  summarizeTutorSeasons,
  type TutorSeasonStat,
} from "@/lib/tutor-family";
import { cn } from "@/lib/utils";

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-mf-canvas px-2.5 py-2 text-center">
      <p className="text-lg font-semibold tabular-nums text-mf-gph-ink">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-mf-text-muted">
        {label}
      </p>
    </div>
  );
}

export function TutorManualStats({
  seasons,
  className,
  eyebrow = "Registrado por el tutor",
}: {
  seasons: TutorSeasonStat[];
  className?: string;
  eyebrow?: string;
}) {
  if (!seasons.length) return null;
  const totals = summarizeTutorSeasons(seasons);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[var(--mf-shadow)]",
        className,
      )}
    >
      <div className="border-b border-mf-border-subtle bg-mf-canvas/60 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          {eyebrow}
        </p>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Torneos y números capturados por el tutor
          {totals.matches > 0 || totals.minutes > 0
            ? ` · ${totals.matches} partidos · ${totals.goals} goles · ${totals.assists} asist. · ${totals.minutes} min`
            : ""}
        </p>
      </div>

      {(totals.matches > 0 || totals.minutes > 0) && seasons.length > 1 ? (
        <div className="grid grid-cols-2 gap-2 border-b border-mf-border-subtle px-4 py-4 sm:grid-cols-4 sm:px-5">
          <Cell label="Partidos" value={totals.matches} />
          <Cell label="Goles" value={totals.goals} />
          <Cell label="Asistencias" value={totals.assists} />
          <Cell label="Minutos" value={totals.minutes} />
        </div>
      ) : null}

      <ul className="divide-y divide-mf-border-subtle">
        {seasons.map((row) => (
          <li key={row.id} className="px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-mf-gph-ink">
                  {row.tournament_name}
                </p>
                <p className="mt-0.5 text-xs text-mf-text-muted">
                  {[row.season_label, row.team_name].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <Cell label="PJ" value={row.matches} />
              <Cell label="Goles" value={row.goals} />
              <Cell label="Asist." value={row.assists} />
              <Cell label="Min" value={row.minutes} />
            </div>
            {row.notes ? (
              <p className="mt-3 text-sm leading-6 text-mf-text-secondary">{row.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
