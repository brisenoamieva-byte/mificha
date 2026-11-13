"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import {
  FAMILY_PRODUCTS,
  formatMxn,
  type FamilyOrderRow,
} from "@/lib/gph-commerce";
import { DIAGNOSIS_KIND_LABELS } from "@/lib/player-diagnosis";
import type { LedgerDiagnosis, PartnershipLedger } from "@/lib/partnership-ledger";

function statusLabel(status: FamilyOrderRow["status"]) {
  if (status === "paid") return "Pagado";
  if (status === "pending") return "Pendiente";
  if (status === "failed") return "Fallido";
  return "Vencido";
}

function formatDay(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function FamilyOrdersAdmin() {
  const [ledger, setLedger] = useState<PartnershipLedger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void diagnosisAuthedFetch("/fut/api/pay/orders")
      .then((payload) => {
        if (!cancelled) setLedger(payload as unknown as PartnershipLedger);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó el reparto.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-mf-text-muted">Cargando ganancias…</p>;
  if (error) return <p className="text-sm text-mf-danger">{error}</p>;
  if (!ledger) return null;

  const { collected, pendingDiagnoses } = ledger;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Privado · Ricardo y Gustavo
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-mf-text">Ganancias</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mf-text-secondary">
          Desde el {formatDay(ledger.cutoff)}. Diagnóstico de {FAMILY_PRODUCTS.diagnosis.priceLabel}:{" "}
          {formatMxn(FAMILY_PRODUCTS.diagnosis.mifichaShareMxn)} para Ricardo y{" "}
          {formatMxn(FAMILY_PRODUCTS.diagnosis.gphShareMxn)} para Gustavo. Membresía de{" "}
          {FAMILY_PRODUCTS.membership.priceLabel}: {formatMxn(FAMILY_PRODUCTS.membership.mifichaShareMxn)}{" "}
          para cada uno. Solo suma lo cobrado.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/fut/interno/socios" className="font-semibold text-mf-brand hover:underline">
            Ver cuentas persona (socios)
          </Link>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl bg-mf-gph-ink px-4 py-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph-hot">
            Ricardo · MiFicha
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{formatMxn(collected.mificha)}</p>
          <p className="mt-1 text-xs text-white/60">Cobrado</p>
        </article>
        <article className="rounded-xl border border-mf-border bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
            Gustavo · GPH
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
            {formatMxn(collected.gph)}
          </p>
          <p className="mt-1 text-xs text-mf-text-muted">Cobrado</p>
        </article>
        <article className="rounded-xl border border-mf-border bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            Por cobrar
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-mf-gph-ink">
            {pendingDiagnoses.count}
          </p>
          <p className="mt-1 text-xs text-mf-text-muted">
            Diagnósticos iniciales sin pago. Si se cobran: Ricardo{" "}
            {formatMxn(pendingDiagnoses.mificha)} · Gustavo {formatMxn(pendingDiagnoses.gph)}.
          </p>
        </article>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-mf-text">Cobros</h2>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {collected.diagnosisCount} diagnósticos y {collected.membershipCount} membresías pagadas
            · {formatMxn(collected.total)}
          </p>
        </div>
        <OrderTable rows={ledger.orders} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-mf-text">Diagnósticos</h2>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Se listan todos. Solo los del {formatDay(ledger.cutoff)} en adelante entran al
            reparto. Seguimiento/revaloración no generan otros $600: el año ya va en la
            evaluación de {FAMILY_PRODUCTS.diagnosis.priceLabel}.
          </p>
        </div>
        <DiagnosisTable rows={ledger.diagnoses} cutoff={ledger.cutoff} />
      </section>
    </div>
  );
}

function OrderTable({ rows }: { rows: FamilyOrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-mf-border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-mf-border text-[11px] uppercase tracking-[0.12em] text-mf-text-muted">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Jugador</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Ricardo</th>
            <th className="px-4 py-3">Gustavo</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-mf-border-subtle">
              <td className="px-4 py-3 tabular-nums">{formatDay(row.paid_at ?? row.created_at)}</td>
              <td className="px-4 py-3">{FAMILY_PRODUCTS[row.sku]?.publicName ?? row.sku}</td>
              <td className="px-4 py-3">
                {row.player_name || "—"}
                <span className="block text-xs text-mf-text-muted">{row.payer_name}</span>
              </td>
              <td className="px-4 py-3 tabular-nums">{formatMxn(row.amount_mxn)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMxn(row.mificha_share_mxn)}</td>
              <td className="px-4 py-3 tabular-nums">{formatMxn(row.gph_share_mxn)}</td>
              <td className="px-4 py-3">{statusLabel(row.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-mf-text-muted">Aún no hay cobros desde esta fecha.</p>
      ) : null}
    </div>
  );
}

function DiagnosisTable({
  rows,
  cutoff,
}: {
  rows: LedgerDiagnosis[];
  cutoff: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-mf-border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-mf-border text-[11px] uppercase tracking-[0.12em] text-mf-text-muted">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Jugador</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Ricardo</th>
            <th className="px-4 py-3">Gustavo</th>
            <th className="px-4 py-3">Cobro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-mf-border-subtle">
              <td className="px-4 py-3 tabular-nums">{formatDay(row.evaluatedAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/fut/dashboard/diagnostico/${row.id}`} className="font-medium hover:underline">
                  {row.playerName}
                </Link>
                <span className="block text-xs text-mf-text-muted">{row.evaluatorName}</span>
                {!row.inAgreement ? (
                  <span className="mt-1 inline-block rounded-full bg-mf-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-mf-text-muted">
                    Antes del {formatDay(cutoff)}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">{DIAGNOSIS_KIND_LABELS[row.kind]}</td>
              <td className="px-4 py-3 tabular-nums">
                {row.inAgreement && row.billable ? formatMxn(row.mifichaShareMxn) : "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {row.inAgreement && row.billable ? formatMxn(row.gphShareMxn) : "—"}
              </td>
              <td className="px-4 py-3">
                {!row.inAgreement
                  ? "Fuera de acuerdo"
                  : !row.billable
                    ? "Incluido"
                    : row.collected
                      ? "Pagado"
                      : "Sin cobro"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-mf-text-muted">Aún no hay diagnósticos registrados.</p>
      ) : null}
    </div>
  );
}
