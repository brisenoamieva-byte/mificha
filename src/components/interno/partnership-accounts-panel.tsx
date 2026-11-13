"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PartnershipAccountsSnapshot } from "@/lib/partnership-accounts";
import { supabase } from "@/lib/supabase";

function formatDay(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function PartnershipAccountsPanel() {
  const [data, setData] = useState<PartnershipAccountsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("Inicia sesión.");
        const response = await fetch("/fut/api/interno/partnership-accounts", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = (await response.json()) as PartnershipAccountsSnapshot & {
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error || "No autorizado.");
        if (!cancelled) setData(payload);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando cuentas…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Privado · solo socios
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-mf-gph-ink sm:text-3xl">
          Cuentas persona
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Visible únicamente para Ricardo y Gustavo. Nadie más en la plataforma puede
          abrir esta página ni la API.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {data.partners.map((partner) => (
          <li
            key={partner.email}
            className="rounded-xl border border-mf-border bg-white px-4 py-4"
          >
            <p className="text-sm font-semibold text-mf-gph-ink">{partner.name}</p>
            <p className="mt-1 text-xs text-mf-text-muted">{partner.email}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-mf-border bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Cuentas
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
            {data.totals.accounts}
          </p>
        </article>
        <article className="rounded-xl border border-mf-border bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Fichas
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
            {data.totals.players}
          </p>
        </article>
        <article className="rounded-xl border border-mf-border bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            En Explorar
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
            {data.totals.exploreOptIn}
          </p>
        </article>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/fut/dashboard/cobros" className="mf-btn-gph">
          Ver ganancias
        </Link>
        <Link href="/fut/explorar" className="mf-btn-gph-ghost">
          Abrir Explorar
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-mf-gph-ink">Listado</h2>
        {data.personaAccounts.length === 0 ? (
          <p className="text-sm text-mf-text-muted">
            Aún no hay cuentas persona registradas.
          </p>
        ) : (
          <ul className="divide-y divide-mf-border-subtle overflow-hidden rounded-xl border border-mf-border bg-white">
            {data.personaAccounts.map((account) => (
              <li key={account.key} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-mf-gph-ink">
                      {account.guardian_email || "Sin correo"}
                    </p>
                    <p className="mt-0.5 text-xs text-mf-text-muted">
                      {[
                        account.guardian_phone || null,
                        `${account.player_count} ficha${account.player_count === 1 ? "" : "s"}`,
                        `${account.explore_opt_in_count} en Explorar`,
                        account.latest_created_at
                          ? `últ. ${formatDay(account.latest_created_at)}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {account.players.map((player) => {
                    const access = player.public_code;
                    const fichaHref = access ? `/fut/f/${encodeURIComponent(access)}` : null;
                    const kitHref = access
                      ? `/fut/agente/m/${encodeURIComponent(access)}`
                      : null;
                    return (
                      <li
                        key={player.id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mf-text-secondary"
                      >
                        <span className="font-medium text-mf-gph-ink">
                          {player.player_name}
                        </span>
                        <span className="font-mono text-xs text-mf-text-muted">
                          {player.public_code}
                        </span>
                        {player.city ? (
                          <span className="text-xs text-mf-text-muted">{player.city}</span>
                        ) : null}
                        {player.explore_opt_in ? (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                            Explorar
                          </span>
                        ) : (
                          <span className="rounded bg-mf-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                            Privada
                          </span>
                        )}
                        {fichaHref ? (
                          <Link
                            href={fichaHref}
                            className="text-xs font-semibold text-mf-brand hover:underline"
                          >
                            Ver ficha
                          </Link>
                        ) : null}
                        {kitHref ? (
                          <Link
                            href={kitHref}
                            className="text-xs font-semibold text-mf-gph hover:underline"
                          >
                            Descargar PDF
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
