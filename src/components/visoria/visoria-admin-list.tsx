"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import { VISORIA_EVENT, type VisoriaRegistrationRow } from "@/lib/visoria-event";

export function VisoriaAdminList() {
  const [rows, setRows] = useState<VisoriaRegistrationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void diagnosisAuthedFetch("/fut/api/visorias")
      .then((payload) => {
        if (cancelled) return;
        setRows((payload.registrations as VisoriaRegistrationRow[]) ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó la lista.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      total: rows.length,
      femenil: rows.filter((row) => row.category === "femenil").length,
      varonil: rows.filter((row) => row.category === "varonil").length,
      jueves: rows.filter((row) => row.attend_thursday).length,
      viernes: rows.filter((row) => row.attend_friday).length,
    };
  }, [rows]);

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando registros…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-mf-border bg-white p-6">
        <p className="font-semibold text-mf-text">{error}</p>
        <p className="mt-2 text-sm text-mf-text-secondary">
          Si dice que falta la tabla, ejecuta <code>supabase/visoria-registrations.sql</code>{" "}
          en el SQL Editor de Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {VISORIA_EVENT.organizers}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-mf-text">
            Registros · visorías Querétaro
          </h1>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {counts.total} inscritos · {counts.femenil} femenil · {counts.varonil} varonil ·{" "}
            {counts.jueves} jueves · {counts.viernes} viernes
          </p>
        </div>
        <Link href="/fut/visorias" className="mf-btn-gph" target="_blank">
          Ver formulario público
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-mf-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-mf-border text-[11px] text-mf-text-muted">
              <th className="px-3 py-2 font-medium">Folio</th>
              <th className="px-3 py-2 font-medium">Jugador</th>
              <th className="px-3 py-2 font-medium">Cat.</th>
              <th className="px-3 py-2 font-medium">Nacimiento</th>
              <th className="px-3 py-2 font-medium">Tutor / WhatsApp</th>
              <th className="px-3 py-2 font-medium">Días</th>
              <th className="px-3 py-2 font-medium">Origen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-mf-text-muted">
                  Todavía no hay registros en plataforma. Comparte{" "}
                  <span className="font-medium text-mf-text">mificha.mx/fut/visorias</span>.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-mf-border-subtle align-top">
                  <td className="px-3 py-2 font-mono text-xs">{row.folio}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{row.player_full_name}</p>
                    <p className="text-[11px] text-mf-text-muted">
                      {[row.current_club, row.city].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className="px-3 py-2 capitalize">{row.category}</td>
                  <td className="px-3 py-2 tabular-nums">{row.birth_date}</td>
                  <td className="px-3 py-2">
                    <p>{row.guardian_name}</p>
                    <a
                      className="text-xs font-medium text-mf-gph hover:underline"
                      href={`https://wa.me/${row.guardian_phone}`}
                    >
                      {row.guardian_phone}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.attend_thursday ? "Jue 26" : null}
                    {row.attend_thursday && row.attend_friday ? " · " : null}
                    {row.attend_friday ? "Vie 27" : null}
                    {row.gph_selected ? " · GPH" : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-mf-text-muted">{row.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
