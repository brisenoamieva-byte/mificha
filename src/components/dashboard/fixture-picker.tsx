"use client";

import { formatKickoffDateTime } from "@/lib/match-utils";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/database";

interface FixturePickerProps {
  fixtures: Match[];
  selectedMatchId?: string | null;
  onSelect: (match: Match) => void;
  className?: string;
}

export function FixturePicker({
  fixtures,
  selectedMatchId,
  onSelect,
  className,
}: FixturePickerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Elige la jornada</h2>
        <p className="mt-1 text-sm text-slate-600">
          Partidos publicados por MiFicha. Selecciona el que acabas de jugar para
          capturar stats.
        </p>
      </div>

      <ul className="space-y-3">
        {fixtures.map((fixture) => {
          const active = fixture.id === selectedMatchId;

          return (
            <li key={fixture.id}>
              <button
                type="button"
                onClick={() => onSelect(fixture)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-mf-accent bg-mf-accent-soft/40 ring-2 ring-mf-accent/30"
                    : "border-slate-200 bg-white hover:border-mf-brand/30 hover:shadow-sm",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {fixture.is_official ? "Jornada oficial" : "Evento MiFicha"}
                      {fixture.category ? ` · ${fixture.category}` : ""}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      vs {fixture.opponent}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatKickoffDateTime(fixture.kickoff_at, fixture.match_date)}
                      {fixture.venue_name ? ` · ${fixture.venue_name}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      fixture.status === "postponed"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-mf-brand-soft text-mf-brand",
                    )}
                  >
                    {fixture.status === "postponed" ? "Pospuesto" : "Por jugar"}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
