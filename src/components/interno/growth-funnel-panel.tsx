"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GrowthFunnelSnapshot } from "@/lib/growth-funnel";
import { supabase } from "@/lib/supabase";

export function GrowthFunnelPanel() {
  const [data, setData] = useState<GrowthFunnelSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Inicia sesión.");
        const response = await fetch("/fut/api/interno/growth-funnel", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = (await response.json()) as GrowthFunnelSnapshot & {
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error || "No autorizado.");
        if (!cancelled) setData(payload);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!data) return <p className="text-sm text-mf-text-muted">Cargando embudo…</p>;

  const cards = [
    ["Roster", data.roster],
    ["Opt-in", `${data.exploreOptIn} (${data.optInRate}%)`],
    ["Listos Explorar", data.exploreReady],
    ["Estados ≥100", data.statesWith100Plus],
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Interno · crecimiento
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-mf-gph-ink">
          Embudo viral (90 días)
        </h1>
        <p className="mt-2 text-sm text-mf-text-secondary">
          Meta: ≥2 000 fichas · opt-in ≥35% · ≥3 estados con ≥100. Actualizado{" "}
          {new Date(data.generatedAt).toLocaleString("es-MX")}.
        </p>
        <Link href="/fut/interno/socios" className="mt-3 inline-block text-sm font-semibold text-mf-gph hover:underline">
          Ver cuentas sin consentimiento →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-mf-border bg-white px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-mf-border bg-white px-4 py-4">
        <p className="text-sm font-semibold text-mf-gph-ink">Top estados</p>
        <ul className="mt-3 divide-y divide-mf-border">
          {data.topStates.map((row) => (
            <li
              key={row.state}
              className="flex justify-between gap-3 py-2 text-sm"
            >
              <span>{row.state}</span>
              <span className="tabular-nums text-mf-text-secondary">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
