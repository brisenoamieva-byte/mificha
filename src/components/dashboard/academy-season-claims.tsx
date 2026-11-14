"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorSeasonClaim } from "@/lib/tutor-season-claims";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";

export function AcademySeasonClaims({ academyId }: { academyId: string }) {
  const [claims, setClaims] = useState<TutorSeasonClaim[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const payload = await diagnosisAuthedFetch(
        `/fut/api/academy/season-claims?academy_id=${encodeURIComponent(academyId)}`,
      );
      const rows = Array.isArray(payload.claims)
        ? (payload.claims as TutorSeasonClaim[])
        : [];
      setClaims(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar propuestas.");
      setClaims([]);
    }
  }, [academyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(claimId: string, decision: "accepted" | "rejected") {
    setBusyId(claimId);
    setError(null);
    try {
      await diagnosisAuthedFetch("/fut/api/academy/season-claims", {
        method: "POST",
        body: JSON.stringify({
          academy_id: academyId,
          claim_id: claimId,
          decision,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setBusyId(null);
    }
  }

  if (claims.length === 0 && !error) return null;

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50/60 px-4 py-4 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-800">
        Torneos reportados por tutores
      </p>
      <p className="mt-1 text-sm text-sky-950/80">
        No entran al acta oficial del plantel. Acéptalos como referencia verificada
        o recházalos si no corresponden.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <ul className="mt-3 space-y-3">
        {claims.map((claim) => (
          <li
            key={claim.id}
            className="rounded-xl border border-sky-200/80 bg-white px-3 py-3"
          >
            <p className="text-sm font-semibold text-slate-900">
              {claim.child_name}
              <span className="ml-2 font-normal text-slate-500">
                · {claim.tournament_name}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {[claim.season_label, claim.team_name].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-sm tabular-nums text-slate-700">
              {claim.matches} PJ · {claim.goals} goles · {claim.assists} asis. ·{" "}
              {claim.minutes} min
            </p>
            {claim.notes ? (
              <p className="mt-1 text-xs leading-5 text-slate-600">{claim.notes}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === claim.id}
                onClick={() => void decide(claim.id, "accepted")}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Aceptar como referencia
              </button>
              <button
                type="button"
                disabled={busyId === claim.id}
                onClick={() => void decide(claim.id, "rejected")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
