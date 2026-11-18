"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GphAgreement } from "@/lib/gph-agreements";
import { cn } from "@/lib/utils";

export function TutorAgreementsInbox({ className }: { className?: string }) {
  const [rows, setRows] = useState<GphAgreement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setRows([]);
        return;
      }
      const response = await fetch("/fut/api/tutor/agreements", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json()) as {
        agreements?: GphAgreement[];
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "No se pudieron cargar cartas.");
        setRows([]);
        return;
      }
      setRows(payload.agreements ?? []);
    } catch {
      setError("Error de red.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = rows.filter((row) => row.status === "sent");
  const others = rows.filter((row) => row.status !== "sent");

  if (rows.length === 0 && !error) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-mf-border bg-white px-4 py-4 sm:px-5",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
        Cartas GPH
      </p>
      <p className="mt-1 text-sm text-mf-text-secondary">
        Reglamento y Carta Compromiso para firmar en línea.
      </p>
      {error ? (
        <p className="mt-3 rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
          {error}
        </p>
      ) : null}
      <ul className="mt-3 divide-y divide-mf-border-subtle">
        {[...pending, ...others].map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="text-sm font-semibold text-mf-gph-ink">
                {row.fields.player_name}
              </p>
              <p className="text-xs text-mf-text-muted">
                {row.status === "sent"
                  ? "Pendiente de tu firma"
                  : row.status === "signed_tutor"
                    ? "Firmada · espera GPH"
                    : row.status === "active"
                      ? "Activa"
                      : row.status}
              </p>
            </div>
            <Link
              href={`/fut/tutor/acuerdo/${row.id}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold",
                row.status === "sent"
                  ? "bg-mf-gph text-white"
                  : "border border-mf-border text-mf-text-muted",
              )}
            >
              {row.status === "sent" ? "Firmar" : "Ver"}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
