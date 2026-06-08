"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe2, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export interface PlatformSeasonRecord {
  id: string;
  name: string;
  slug: string;
  region: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  assigned_academies: number;
}

async function authedFetch(input: string, init?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Inicia sesión.");

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as { error?: string; assigned?: number; total?: number };

  if (!response.ok) {
    throw new Error(payload.error ?? "Error de red.");
  }

  return payload;
}

export function PlatformSeasonSection() {
  const [platformSeasons, setPlatformSeasons] = useState<PlatformSeasonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [name, setName] = useState("Escolar Querétaro 2025–2026");
  const [region, setRegion] = useState("Querétaro");
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2026-07-31");

  const loadPlatformSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch("/api/interno/platform-seasons")) as {
        platformSeasons: PlatformSeasonRecord[];
      };
      setPlatformSeasons(payload.platformSeasons ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se cargaron temporadas de plataforma.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlatformSeasons();
  }, [loadPlatformSeasons]);

  const activePlatformSeason =
    platformSeasons.find((season) => season.is_active) ?? platformSeasons[0] ?? null;

  async function handleCreatePlatformSeason(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await authedFetch("/api/interno/platform-seasons", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          region: region.trim(),
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        }),
      });
      toast.success("Temporada MiFicha creada.");
      await loadPlatformSeasons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se creó la temporada.");
    } finally {
      setSaving(false);
    }
  }

  async function assignToPublicAcademies(platformSeasonId: string) {
    setAssigning(true);
    try {
      const result = await authedFetch("/api/interno/platform-seasons", {
        method: "POST",
        body: JSON.stringify({
          platform_season_id: platformSeasonId,
          assign_public: true,
        }),
      });
      toast.success(
        `Temporada asignada a ${result.assigned ?? 0} de ${result.total ?? 0} academias.`,
      );
      await loadPlatformSeasons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se asignó la temporada.");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.08] p-6">
      <div className="flex items-start gap-3">
        <Globe2 className="mt-0.5 h-5 w-5 text-sky-300" />
        <div>
          <h2 className="text-lg font-semibold">Temporada MiFicha (compartida)</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Un solo ciclo para todas las academias — stats comparables. Créala aquí y
            asígnala en lote; cada colegio recibe su temporada activa vinculada.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando temporadas de plataforma…
        </div>
      ) : (
        <>
          {activePlatformSeason ? (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="font-semibold">{activePlatformSeason.name}</p>
              <p className="mt-1 text-sm text-white/55">
                {activePlatformSeason.start_date} → {activePlatformSeason.end_date}
                {activePlatformSeason.region ? ` · ${activePlatformSeason.region}` : ""}
              </p>
              <p className="mt-2 text-sm text-sky-200">
                {activePlatformSeason.assigned_academies} academia
                {activePlatformSeason.assigned_academies === 1 ? "" : "s"} vinculada
                {activePlatformSeason.assigned_academies === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                disabled={assigning}
                onClick={() => void assignToPublicAcademies(activePlatformSeason.id)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Asignando…
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Asignar a academias públicas
                  </>
                )}
              </button>
            </div>
          ) : null}

          <form onSubmit={handleCreatePlatformSeason} className="mt-5 space-y-4">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50"
              placeholder="Escolar Querétaro 2025–2026"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50"
                placeholder="Región"
              />
              <input
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50"
              />
              <input
                type="date"
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 px-5 py-2.5 text-sm font-semibold text-sky-100 hover:bg-sky-500/10 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando…
                </>
              ) : (
                "Crear temporada de plataforma"
              )}
            </button>
          </form>
        </>
      )}

      <p className="mt-4 text-xs text-white/45">
        Requiere SQL{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-sky-200">
          platform-seasons-shared.sql
        </code>
      </p>
    </section>
  );
}
