"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarPlus, CheckCircle2, Loader2 } from "lucide-react";
import { defaultSeasonName } from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import type { Season } from "@/types/database";

interface AcademyOption {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  is_public: boolean;
  is_certified: boolean;
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

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Error de red.");
  }

  return payload;
}

export function SeasonsAdminPanel() {
  const [academies, setAcademies] = useState<AcademyOption[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(defaultSeasonName());
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2026-07-31");

  const loadAcademies = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch("/api/interno/seasons")) as {
        academies: AcademyOption[];
      };
      setAcademies(payload.academies);
      setSelectedAcademyId((current) => current || payload.academies[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargaron academias.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSeasons = useCallback(async (academyId: string) => {
    if (!academyId) {
      setSeasons([]);
      return;
    }

    try {
      const payload = (await authedFetch(
        `/api/interno/seasons?academy_id=${encodeURIComponent(academyId)}`,
      )) as { seasons: Season[] };
      setSeasons(payload.seasons);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargaron temporadas.");
    }
  }, []);

  useEffect(() => {
    void loadAcademies();
  }, [loadAcademies]);

  useEffect(() => {
    if (selectedAcademyId) {
      void loadSeasons(selectedAcademyId);
    }
  }, [selectedAcademyId, loadSeasons]);

  const selectedAcademy = useMemo(
    () => academies.find((academy) => academy.id === selectedAcademyId) ?? null,
    [academies, selectedAcademyId],
  );

  async function handleCreateSeason(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAcademyId) return;

    setSaving(true);
    try {
      await authedFetch("/api/interno/seasons", {
        method: "POST",
        body: JSON.stringify({
          academy_id: selectedAcademyId,
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
          is_active: true,
        }),
      });
      toast.success("Temporada publicada para la academia.");
      await loadSeasons(selectedAcademyId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se creó la temporada.");
    } finally {
      setSaving(false);
    }
  }

  async function activateSeason(seasonId: string) {
    try {
      await authedFetch("/api/interno/seasons", {
        method: "PATCH",
        body: JSON.stringify({ season_id: seasonId, is_active: true }),
      });
      toast.success("Temporada activada.");
      await loadSeasons(selectedAcademyId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se activó la temporada.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Interno · MiFicha
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Temporadas oficiales
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Publica el ciclo escolar por academia. Los colegios solo leen la
              temporada activa — no pueden crear la suya.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/interno/jornadas"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Jornadas
            </Link>
            <Link
              href="/interno/lanzamiento"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Playbook
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        {loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando academias…
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <label className="block text-sm font-medium text-white/80">
                Academia
              </label>
              <select
                value={selectedAcademyId}
                onChange={(event) => setSelectedAcademyId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
              >
                {academies.map((academy) => (
                  <option key={academy.id} value={academy.id}>
                    {academy.name}
                    {academy.is_certified ? " · certificada" : ""}
                    {academy.city ? ` · ${academy.city}` : ""}
                  </option>
                ))}
              </select>
              {selectedAcademy ? (
                <p className="mt-3 text-sm text-white/55">
                  Slug público:{" "}
                  <Link
                    href={`/a/${selectedAcademy.slug}`}
                    className="text-emerald-300 hover:underline"
                    target="_blank"
                  >
                    /a/{selectedAcademy.slug}
                  </Link>
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold">Temporadas registradas</h2>
              {seasons.length === 0 ? (
                <p className="mt-4 text-sm text-white/55">
                  Esta academia aún no tiene temporadas. Crea la primera abajo.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {seasons.map((season) => (
                    <li
                      key={season.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{season.name}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {season.start_date} → {season.end_date}
                        </p>
                      </div>
                      {season.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Activa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void activateSeason(season.id)}
                          className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                        >
                          Activar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-6">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Publicar temporada</h2>
              </div>
              <form onSubmit={handleCreateSeason} className="mt-5 space-y-4">
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  placeholder="Escolar Querétaro 2025–2026"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                      Inicio
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                      Fin
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving || !selectedAcademyId}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publicando…
                    </>
                  ) : (
                    "Publicar y activar"
                  )}
                </button>
              </form>
            </section>

            <p className="text-sm text-white/45">
              Recuerda ejecutar{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-emerald-200">
                platform-seasons-rls.sql
              </code>{" "}
              en Supabase para bloquear creación por academias.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
