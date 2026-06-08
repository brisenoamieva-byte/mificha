"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { formatOfficialScoreLine } from "@/lib/match-data-governance";
import { getPositionLabel } from "@/lib/dashboard-utils";
import type { Match, Player } from "@/types/database";

interface ActaStatRow {
  player_id: string;
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
}

interface OfficialActaEntryProps {
  fixture: Match;
  authedFetch: (input: string, init?: RequestInit) => Promise<Record<string, unknown>>;
  onSaved: () => void;
}

export function OfficialActaEntry({
  fixture,
  authedFetch,
  onSaved,
}: OfficialActaEntryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<
    Record<string, { goals: number; assists: number; yellow: number; red: number }>
  >({});

  const loadActa = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch(
        `/api/interno/fixtures/acta?fixture_id=${encodeURIComponent(fixture.id)}`,
      )) as {
        players?: Player[];
        stats?: ActaStatRow[];
      };

      const nextEntries: Record<
        string,
        { goals: number; assists: number; yellow: number; red: number }
      > = {};

      for (const player of payload.players ?? []) {
        const stat = payload.stats?.find((row) => row.player_id === player.id);
        nextEntries[player.id] = {
          goals: stat?.goals ?? 0,
          assists: stat?.assists ?? 0,
          yellow: stat?.yellow_cards ?? 0,
          red: stat?.red_cards ?? 0,
        };
      }

      setPlayers(payload.players ?? []);
      setEntries(nextEntries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargó el acta.");
    } finally {
      setLoading(false);
    }
  }, [authedFetch, fixture.id]);

  useEffect(() => {
    if (open) void loadActa();
  }, [open, loadActa]);

  const actaGoalTotal = useMemo(
    () => Object.values(entries).reduce((sum, row) => sum + row.goals, 0),
    [entries],
  );

  const marcadorLine = formatOfficialScoreLine(fixture);

  if (fixture.acta_published_at) {
    return (
      <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-right">
        <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200">
          <ClipboardList className="h-3.5 w-3.5" />
          Acta publicada
        </p>
        <p className="mt-1 text-xs text-white/70">
          {new Date(fixture.acta_published_at).toLocaleDateString("es-MX")}
        </p>
      </div>
    );
  }

  if (!fixture.result) {
    return (
      <p className="max-w-[220px] text-right text-[11px] text-white/45">
        Publica marcador antes del acta
      </p>
    );
  }

  async function handlePublishActa(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const payloadEntries = Object.entries(entries)
        .filter(
          ([, row]) => row.goals > 0 || row.assists > 0 || row.yellow > 0 || row.red > 0,
        )
        .map(([player_id, row]) => ({
          player_id,
          goals: row.goals,
          assists: row.assists,
          yellow_cards: row.yellow,
          red_cards: row.red,
        }));

      if (payloadEntries.length === 0) {
        toast.error("Registra al menos un jugador con stats en el acta.");
        setSaving(false);
        return;
      }

      await authedFetch("/api/interno/fixtures/acta", {
        method: "POST",
        body: JSON.stringify({
          fixture_id: fixture.id,
          entries: payloadEntries,
        }),
      });

      toast.success("Acta oficial publicada.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se publicó el acta.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-500/20"
      >
        Publicar acta
      </button>
    );
  }

  return (
    <form
      onSubmit={handlePublishActa}
      className="w-full min-w-[280px] rounded-xl border border-white/10 bg-black/30 p-3"
    >
      <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">
        <ShieldCheck className="h-3.5 w-3.5" />
        Acta oficial · organizador
      </p>
      {marcadorLine ? (
        <p className="mt-1 text-xs text-emerald-200/90">Marcador: {marcadorLine}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-white/45">
        Goles acta: {actaGoalTotal}
        {fixture.goals_for != null ? ` / ${fixture.goals_for} oficial` : ""}
      </p>

      {loading ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando plantel…
        </p>
      ) : (
        <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
          {players.map((player) => {
            const row = entries[player.id] ?? {
              goals: 0,
              assists: 0,
              yellow: 0,
              red: 0,
            };

            return (
              <li
                key={player.id}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2"
              >
                <p className="truncate text-xs font-semibold text-white">
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-[10px] text-white/45">
                  {getPositionLabel(player.position)}
                  {player.jersey_number ? ` · #${player.jersey_number}` : ""}
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {(
                    [
                      ["G", "goals"],
                      ["A", "assists"],
                      ["🟨", "yellow"],
                      ["🟥", "red"],
                    ] as const
                  ).map(([label, key]) => (
                    <label key={key} className="text-center">
                      <span className="text-[10px] text-white/45">{label}</span>
                      <input
                        type="number"
                        min={0}
                        max={key === "goals" || key === "assists" ? 9 : 1}
                        value={row[key]}
                        onChange={(event) =>
                          setEntries((current) => ({
                            ...current,
                            [player.id]: {
                              ...row,
                              [key]: Number(event.target.value),
                            },
                          }))
                        }
                        className="mt-0.5 w-full rounded border border-white/10 bg-[#0f2038] px-1 py-1 text-center text-xs text-white"
                      />
                    </label>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={saving || loading}
          className="flex-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-[#0a1628] disabled:opacity-60"
        >
          {saving ? "Publicando…" : "Publicar acta"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60"
        >
          Cerrar
        </button>
      </div>
    </form>
  );
}
