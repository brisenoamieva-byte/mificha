"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorLinkRequest } from "@/lib/tutor-link-requests";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";

export function AcademyLinkRequests({ academyId }: { academyId: string }) {
  const [pending, setPending] = useState<TutorLinkRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const payload = await diagnosisAuthedFetch(
        `/fut/api/players/link-tutor?academy_id=${encodeURIComponent(academyId)}`,
      );
      const rows = Array.isArray(payload.pending)
        ? (payload.pending as TutorLinkRequest[])
        : [];
      setPending(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar vínculos.");
      setPending([]);
    }
  }, [academyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: "accept" | "reject", requestId: string) {
    setBusyId(requestId);
    setError(null);
    try {
      await diagnosisAuthedFetch("/fut/api/players/link-tutor", {
        method: "POST",
        body: JSON.stringify({
          action,
          academy_id: academyId,
          request_id: requestId,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setBusyId(null);
    }
  }

  if (pending.length === 0 && !error) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Solicitudes de vínculo tutor
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Une plantel y ficha tutor cuando ambos confirman. Con el mismo código MF, o si
        el tutor también opera esta academia, se liga al instante.
      </p>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <ul className="mt-3 divide-y divide-slate-100">
        {pending.map((row) => {
          const waitingAcademy = row.status === "pending_academy";
          return (
            <li key={row.id} className="py-3 first:pt-1 last:pb-0">
              <p className="text-sm font-semibold text-slate-900">
                {row.player_name}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  ↔ {row.child_name}
                  {row.child_public_code ? ` · ${row.child_public_code}` : ""}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {waitingAcademy
                  ? "El tutor pidió vincular · te toca confirmar"
                  : "Esperando confirmación del tutor"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {waitingAcademy ? (
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => void act("accept", row.id)}
                    className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Aceptar vínculo
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void act("reject", row.id)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {waitingAcademy ? "Rechazar" : "Cancelar"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
