"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { formatOfficialScoreLine } from "@/lib/match-data-governance";
import { getMatchResultLabel } from "@/lib/match-utils";
import { cn } from "@/lib/utils";
import type { Match, MatchResult } from "@/types/database";

interface OfficialResultEntryProps {
  fixture: Match;
  onSaved: () => void;
  authedFetch: (input: string, init?: RequestInit) => Promise<Record<string, unknown>>;
}

export function OfficialResultEntry({
  fixture,
  onSaved,
  authedFetch,
}: OfficialResultEntryProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<MatchResult>(fixture.result ?? "win");
  const [goalsFor, setGoalsFor] = useState(fixture.goals_for ?? 0);
  const [goalsAgainst, setGoalsAgainst] = useState(fixture.goals_against ?? 0);

  const publishedLine = formatOfficialScoreLine(fixture);

  if (publishedLine) {
    return (
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-right">
        <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Marcador oficial
        </p>
        <p className="mt-1 text-sm font-bold text-white">{publishedLine}</p>
      </div>
    );
  }

  async function handlePublishResult(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await authedFetch("/api/interno/fixtures", {
        method: "PATCH",
        body: JSON.stringify({
          fixture_id: fixture.id,
          result,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          lock_result: true,
        }),
      });
      toast.success("Marcador oficial publicado.");
      setOpen(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se publicó el marcador.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
      >
        Registrar marcador
      </button>
    );
  }

  return (
    <form
      onSubmit={handlePublishResult}
      className="w-full min-w-[220px] rounded-xl border border-white/10 bg-black/30 p-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
        Marcador oficial · organizador
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {(["win", "draw", "loss"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setResult(option)}
            className={cn(
              "rounded-lg px-2 py-1.5 text-[11px] font-semibold",
              result === option
                ? "bg-emerald-500/25 text-emerald-100"
                : "bg-white/5 text-white/55",
            )}
          >
            {getMatchResultLabel(option)}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={30}
          value={goalsFor}
          onChange={(event) => setGoalsFor(Number(event.target.value))}
          className="w-14 rounded-lg border border-white/10 bg-[#0f2038] px-2 py-1.5 text-center text-sm text-white"
        />
        <span className="text-white/45">-</span>
        <input
          type="number"
          min={0}
          max={30}
          value={goalsAgainst}
          onChange={(event) => setGoalsAgainst(Number(event.target.value))}
          className="w-14 rounded-lg border border-white/10 bg-[#0f2038] px-2 py-1.5 text-center text-sm text-white"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#0a1628] disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Publicar"}
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
