"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorActivityEvent } from "@/lib/tutor-activity";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";

export function AcademyActivityDisputes({ academyId }: { academyId: string }) {
  const [events, setEvents] = useState<TutorActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await diagnosisAuthedFetch(
        `/fut/api/academy/activity-disputes?academy_id=${encodeURIComponent(academyId)}`,
      );
      const events = Array.isArray(payload.events)
        ? (payload.events as TutorActivityEvent[])
        : [];
      setEvents(events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || events.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
        Revisiones de tutores
      </p>
      <p className="mt-1 text-sm text-amber-950/80">
        Un tutor pidió corregir stats oficiales. Revisa el acta o el partido y
        vuelve a capturar si hace falta.
      </p>
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
          </li>
        ))}
      </ul>
    </section>
  );
}
