"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { TutorActivityEvent } from "@/lib/tutor-activity";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";

export function AcademyActivityDisputes({ academyId }: { academyId: string }) {
  const [events, setEvents] = useState<TutorActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await diagnosisAuthedFetch(
        `/fut/api/academy/activity-disputes?academy_id=${encodeURIComponent(academyId)}`,
      );
      const rows = Array.isArray(payload.events)
        ? (payload.events as TutorActivityEvent[])
        : [];
      setEvents(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar disputas.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(
    eventId: string,
    decision: "confirmed" | "corrected",
  ) {
    setBusyId(eventId);
    setError(null);
    try {
      await diagnosisAuthedFetch("/fut/api/academy/activity-disputes", {
        method: "POST",
        body: JSON.stringify({
          academy_id: academyId,
          event_id: eventId,
          decision,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cerrar la disputa.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading && events.length === 0) return null;
  if (!loading && events.length === 0 && !error) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
        Revisiones de tutores
      </p>
      <p className="mt-1 text-sm text-amber-950/80">
        Un tutor pidió corregir stats. Abre el partido, corrige y luego marca
        “Ya corregí”. Si los números están bien, confirma.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <ul className="mt-3 space-y-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-xl border border-amber-200/80 bg-white px-3 py-3"
          >
            <p className="text-sm font-semibold text-slate-900">
              {event.player_name}
              <span className="ml-2 font-normal text-slate-500">
                vs {event.opponent}
                {event.match_date ? ` · ${event.match_date}` : ""}
              </span>
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-slate-600">
              Registrado: {event.goals} goles · {event.assists} asis. · {event.minutes}{" "}
              min
            </p>
            {event.dispute_note ? (
              <p className="mt-1.5 text-sm leading-6 text-amber-950">
                {event.dispute_note}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {event.match_id ? (
                <Link
                  href={`/fut/dashboard/partidos/nuevo?matchId=${event.match_id}`}
                  className="rounded-xl bg-[#1B4F8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#164278]"
                >
                  Corregir partido
                </Link>
              ) : null}
              <button
                type="button"
                disabled={busyId === event.id}
                onClick={() => void decide(event.id, "corrected")}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Ya corregí / releer stats
              </button>
              <button
                type="button"
                disabled={busyId === event.id}
                onClick={() => void decide(event.id, "confirmed")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Confirmar que está bien
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
