"use client";

import { useEffect, useMemo, useState } from "react";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import {
  FAMILY_PRODUCTS,
  formatMxn,
  GPH_PARTNERSHIP,
  type FamilyOrderRow,
} from "@/lib/gph-commerce";

export function FamilyOrdersAdmin() {
  const [rows, setRows] = useState<FamilyOrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void diagnosisAuthedFetch("/fut/api/pay/orders")
      .then((payload) => {
        if (!cancelled) setRows((payload.orders as FamilyOrderRow[]) ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargaron los cobros.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const paid = rows.filter((row) => row.status === "paid");
    return {
      count: paid.length,
      mificha: paid.reduce((sum, row) => sum + row.mificha_share_mxn, 0),
      gph: paid.reduce((sum, row) => sum + row.gph_share_mxn, 0),
    };
  }, [rows]);

  if (loading) return <p className="text-sm text-mf-text-muted">Cargando cobros…</p>;
  if (error) return <p className="text-sm text-mf-danger">{error}</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Split interno
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-mf-text">Cobros familia</h1>
        <p className="mt-2 text-sm text-mf-text-secondary">
          {GPH_PARTNERSHIP.platformOperator} · ${GPH_PARTNERSHIP.mifichaShareMxn} por venta.
          {GPH_PARTNERSHIP.gphOperator} el resto. Pagados: {totals.count} · MiFicha{" "}
          {formatMxn(totals.mificha)} · GPH {formatMxn(totals.gph)}.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-mf-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-mf-border text-[11px] uppercase tracking-[0.12em] text-mf-text-muted">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Tutor</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">MiFicha</th>
              <th className="px-4 py-3">GPH</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-mf-border-subtle">
                <td className="px-4 py-3 font-mono text-xs">{row.folio}</td>
                <td className="px-4 py-3">{FAMILY_PRODUCTS[row.sku]?.publicName ?? row.sku}</td>
                <td className="px-4 py-3">
                  {row.payer_name}
                  {row.player_name ? (
                    <span className="block text-xs text-mf-text-muted">{row.player_name}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatMxn(row.amount_mxn)}</td>
                <td className="px-4 py-3">{formatMxn(row.mificha_share_mxn)}</td>
                <td className="px-4 py-3">{formatMxn(row.gph_share_mxn)}</td>
                <td className="px-4 py-3 capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-mf-text-muted">Aún no hay cobros.</p>
        ) : null}
      </div>
    </div>
  );
}
