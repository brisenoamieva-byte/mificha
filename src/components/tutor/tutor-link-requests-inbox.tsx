"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorLinkRequest } from "@/lib/tutor-link-requests";
import { cn } from "@/lib/utils";

export function TutorLinkRequestsInbox({
  className,
  onChanged,
  refreshKey = 0,
}: {
  className?: string;
  onChanged?: () => void;
  refreshKey?: number;
}) {
  const [pending, setPending] = useState<TutorLinkRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/fut/api/tutor/links?pending=1");
      const payload = (await response.json()) as {
        pending?: TutorLinkRequest[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "No se pudieron cargar vínculos.");
        setPending([]);
        return;
      }
      setPending(payload.pending ?? []);
    } catch {
      setError("Error de red al cargar vínculos.");
      setPending([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function act(action: "accept" | "reject", requestId: string) {
    setBusyId(requestId);
    setError(null);
    try {
      const response = await fetch("/fut/api/tutor/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, request_id: requestId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo actualizar.");
        return;
      }
      await load();
      onChanged?.();
    } catch {
      setError("Error de red.");
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0 && !error) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-mf-border bg-white px-4 py-4 sm:px-5",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
        Vínculos con academia
      </p>
      <p className="mt-1 text-sm text-mf-text-secondary">
        Confirma o cancela para unir la ficha del tutor con el plantel (misma persona).
      </p>

      {error ? (
        <p className="mt-3 rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
          {error}
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-mf-border-subtle">
        {pending.map((row) => {
          const waitingTutor = row.status === "pending_tutor";
          return (
            <li key={row.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-mf-gph-ink">
                {row.child_name}
                <span className="ml-2 rounded-full bg-mf-gph-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-mf-gph">
                  {waitingTutor ? "Te toca confirmar" : "Esperando academia"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-mf-text-muted">
                {row.academy_name} · {row.player_name}
                {row.child_public_code ? ` · ${row.child_public_code}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {waitingTutor ? (
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => void act("accept", row.id)}
                    className="mf-btn-gph text-xs"
                  >
                    Aceptar vínculo
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void act("reject", row.id)}
                  className="rounded-lg border border-mf-border bg-white px-3 py-1.5 text-xs font-semibold text-mf-text-muted hover:text-mf-text"
                >
                  {waitingTutor ? "Rechazar" : "Cancelar solicitud"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
