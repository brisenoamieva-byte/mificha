"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PrintableQrSheet } from "@/components/dashboard/printable-qr-sheet";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { hasPublicConsent } from "@/lib/privacy";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";

export function PlantelPrintContent() {
  const { academy } = useDashboard();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    if (!academy) return;

    setLoading(true);
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("academy_id", academy.id)
      .eq("is_public", true)
      .not("public_consent_at", "is", null)
      .order("last_name", { ascending: true });

    setPlayers((data ?? []).filter((player) => hasPublicConsent(player)));
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  if (!academy) return <NoAcademyState />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/plantel"
            className="text-sm font-medium text-[#1B4F8C] hover:underline"
          >
            ← Volver al plantel
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            QR imprimibles
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Solo jugadores con consentimiento y ficha pública. Imprime y reparte
            en la cancha.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={players.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-50"
        >
          <Printer className="h-4 w-4" />
          Imprimir hoja
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <PrintableQrSheet academy={academy} players={players} />
      )}
    </div>
  );
}
