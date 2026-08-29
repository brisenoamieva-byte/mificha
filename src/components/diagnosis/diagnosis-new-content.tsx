"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DiagnosisForm } from "@/components/diagnosis/diagnosis-form";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";

export function DiagnosisNewContent() {
  const { academy, isGphEvaluator } = useDashboard();
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [academies, setAcademies] = useState<Array<{ id: string; name: string }>>([]);
  const [academyId, setAcademyId] = useState(
    searchParams.get("academy") || academy?.id || "",
  );

  useEffect(() => {
    if (!isGphEvaluator) return;
    void diagnosisAuthedFetch("/fut/api/diagnoses/academies")
      .then((payload) => {
        const list = (payload.academies as Array<{ id: string; name: string }>) ?? [];
        setAcademies(list);
        const fallback = list[0];
        // Updater funcional: preselecciona sin re-disparar la carga al cambiar de academia.
        if (fallback) setAcademyId((current) => current || fallback.id);
      })
      .catch(() => setAcademies([]));
  }, [isGphEvaluator]);

  useEffect(() => {
    const selected = academyId || academy?.id;
    if (!selected) {
      setPlayers([]);
      return;
    }
    if (isGphEvaluator) {
      void diagnosisAuthedFetch(
        `/fut/api/diagnoses/players?academy_id=${encodeURIComponent(selected)}`,
      )
        .then((payload) => setPlayers((payload.players as Player[]) ?? []))
        .catch(() => setPlayers([]));
      return;
    }
    void supabase
      .from("players")
      .select("*")
      .eq("academy_id", selected)
      .order("last_name", { ascending: true })
      .then(({ data }) => setPlayers(data ?? []));
  }, [academy?.id, academyId, isGphEvaluator]);

  if (!academy && !isGphEvaluator) return <NoAcademyState />;
  if (!players) return <Skeleton className="h-[480px] w-full rounded-2xl" />;

  const selectedId = academyId || academy?.id || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mf-page-title">Nueva evaluación</h1>
          <p className="mt-1 text-sm text-mf-text-secondary">
            En cancha se captura cada prueba en su unidad. El 1–5 técnico sale solo. Cierras
            físico y mental, y Generar ficha arma lectura y plan.
          </p>
          {isGphEvaluator && academies.length > 0 ? (
            <label className="mt-3 block max-w-sm text-xs font-medium text-mf-text-secondary">
              Academia del jugador
              <select
                value={selectedId}
                onChange={(event) => {
                  setAcademyId(event.target.value);
                  setPlayers(null);
                }}
                className="mf-input mt-1 text-sm"
              >
                {academies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
      </div>
      <DiagnosisForm
        players={players}
        initialPlayerId={searchParams.get("player") ?? undefined}
        academyId={selectedId}
        onPlayerCreated={(player) =>
          setPlayers((current) =>
            [...(current ?? []), player].sort((a, b) =>
              a.last_name.localeCompare(b.last_name, "es"),
            ),
          )
        }
      />
    </div>
  );
}
