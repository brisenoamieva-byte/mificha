"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorActivityEvent } from "@/lib/tutor-activity";
import { cn } from "@/lib/utils";

function formatMatchLine(event: TutorActivityEvent) {
  const bits = [
    event.match_date || null,
    event.opponent ? `vs ${event.opponent}` : null,
    event.academy_name,
  ].filter(Boolean);
  return bits.join(" · ");
}

function statsLine(event: TutorActivityEvent) {
  return `${event.goals} gol${event.goals === 1 ? "" : "es"} · ${event.assists} asis. · ${event.minutes} min`;
}

export function TutorActivityInbox({ className }: { className?: string }) {
  const [events, setEvents] = useState<TutorActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/fut/api/tutor/activity");
      const payload = (await response.json()) as {
        events?: TutorActivityEvent[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo cargar la actividad.");
        return;
      }
      setEvents(payload.events ?? []);
    } catch {
      setError("Error de red al cargar actividad.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function postAction(
    action: "acknowledge" | "dispute",
    eventId: string,
    note?: string,
  ) {
    setBusyId(eventId);
    setError(null);
    try {
      const response = await fetch("/fut/api/tutor/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, event_id: eventId, note }),
      });
      const payload = (await response.json()) as {
        event?: TutorActivityEvent;
        error?: string;
      };
      if (!response.ok || !payload.event) {
        setError(payload.error ?? "No se pudo actualizar.");
        return;
      }
      setEvents((prev) =>
        prev.map((row) => (row.id === payload.event!.id ? payload.event! : row)),
      );
      setDisputeId(null);
      setDisputeNote("");
    } catch {
      setError("Error de red.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = events
    .filter((row) => row.status !== "acknowledged")
    .slice(0, 8);
  const unread = events.filter(
    (row) => row.status === "published" || row.status === "resolved",
  ).length;

  if (loading && events.length === 0) {
    return null;
  }
  if (!loading && visible.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-mf-border bg-white px-4 py-4 sm:px-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Actividad del plantel
          </p>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Stats oficiales de la academia ligada
            {unread > 0 ? ` · ${unread} sin revisar` : ""}.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
          {error}
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-mf-border-subtle">
        {visible.map((event) => (
          <li key={event.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-mf-gph-ink">
                  {event.player_name}
                  {event.status === "disputed" ? (
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-800">
                      En revisión
                    </span>
                  ) : event.status === "resolved" ? (
                    <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-800">
                      Revisado
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                      Oficial
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-mf-text-muted">{formatMatchLine(event)}</p>
                <p className="mt-1 text-sm tabular-nums text-mf-text-secondary">
                  {statsLine(event)}
                </p>
                {event.status === "disputed" && event.dispute_note ? (
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">
                    Tu nota: {event.dispute_note}
                  </p>
                ) : null}
                {event.status === "resolved" && event.resolution_note ? (
                  <p className="mt-1 text-xs leading-5 text-sky-900/80">
                    Academia: {event.resolution_note}
                  </p>
                ) : null}
              </div>
              {event.status === "published" ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === event.id}
                    onClick={() => void postAction("acknowledge", event.id)}
                    className="rounded-lg border border-mf-border bg-white px-3 py-1.5 text-xs font-semibold text-mf-gph-ink hover:border-mf-gph/40"
                  >
                    Entendido
                  </button>
                  <button
                    type="button"
                    disabled={busyId === event.id}
                    onClick={() => {
                      setDisputeId(event.id);
                      setDisputeNote("");
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-mf-text-muted hover:text-mf-text"
                  >
                    Pedir revisión
                  </button>
                </div>
              ) : null}
              {event.status === "resolved" ? (
                <button
                  type="button"
                  disabled={busyId === event.id}
                  onClick={() => void postAction("acknowledge", event.id)}
                  className="rounded-lg border border-mf-border bg-white px-3 py-1.5 text-xs font-semibold text-mf-gph-ink hover:border-mf-gph/40"
                >
                  Entendido
                </button>
              ) : null}
            </div>

            {disputeId === event.id ? (
              <div className="mt-3 space-y-2 rounded-lg bg-mf-canvas px-3 py-3">
                <label className="block text-xs font-medium text-mf-text">
                  ¿Qué hay que revisar?
                  <textarea
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    rows={2}
                    className="mf-input mt-1 text-sm"
                    placeholder="Ej. marcó 1 gol, no 2; o no jugó esos minutos…"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === event.id}
                    onClick={() => void postAction("dispute", event.id, disputeNote)}
                    className="mf-btn-gph text-xs"
                  >
                    Enviar revisión
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-mf-text-muted"
                    onClick={() => {
                      setDisputeId(null);
                      setDisputeNote("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
