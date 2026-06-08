"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { FixtureImportSection } from "@/components/interno/fixture-import-section";
import { formatKickoffDateTime } from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import type { Match, Season } from "@/types/database";

interface AcademyOption {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  is_public: boolean;
  is_certified: boolean;
}

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
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

export function FixturesAdminPanel() {
  const [academies, setAcademies] = useState<AcademyOption[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState("");
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState(todayIsoDate());
  const [kickoffTime, setKickoffTime] = useState("10:00");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isOfficial, setIsOfficial] = useState(true);

  const loadAcademies = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch("/api/interno/fixtures")) as {
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

  const loadFixtures = useCallback(async (academyId: string) => {
    if (!academyId) {
      setFixtures([]);
      setActiveSeason(null);
      return;
    }

    try {
      const payload = (await authedFetch(
        `/api/interno/fixtures?academy_id=${encodeURIComponent(academyId)}`,
      )) as { season: Season | null; fixtures: Match[] };

      setActiveSeason(payload.season);
      setFixtures(payload.fixtures);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargaron jornadas.");
    }
  }, []);

  useEffect(() => {
    void loadAcademies();
  }, [loadAcademies]);

  useEffect(() => {
    if (selectedAcademyId) {
      void loadFixtures(selectedAcademyId);
    }
  }, [selectedAcademyId, loadFixtures]);

  const selectedAcademy = useMemo(
    () => academies.find((academy) => academy.id === selectedAcademyId) ?? null,
    [academies, selectedAcademyId],
  );

  const pendingFixtures = useMemo(
    () =>
      fixtures.filter((fixture) =>
        ["scheduled", "postponed"].includes(fixture.status),
      ),
    [fixtures],
  );

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAcademyId) return;

    setSaving(true);
    try {
      await authedFetch("/api/interno/fixtures", {
        method: "POST",
        body: JSON.stringify({
          academy_id: selectedAcademyId,
          season_id: activeSeason?.id,
          opponent: opponent.trim(),
          match_date: matchDate,
          kickoff_time: kickoffTime,
          venue_name: venueName,
          venue_address: venueAddress,
          category,
          notes,
          is_public: isPublic,
          is_official: isOfficial,
        }),
      });

      toast.success("Jornada publicada.");
      setOpponent("");
      setVenueName("");
      setVenueAddress("");
      setCategory("");
      setNotes("");
      await loadFixtures(selectedAcademyId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se publicó la jornada.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelFixture(fixtureId: string) {
    try {
      await authedFetch("/api/interno/fixtures", {
        method: "PATCH",
        body: JSON.stringify({ fixture_id: fixtureId, status: "cancelled" }),
      });
      toast.success("Jornada cancelada.");
      await loadFixtures(selectedAcademyId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se canceló.");
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
              Jornadas oficiales
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Publica rival, fecha, sede y categoría. Las academias solo capturan
              stats sobre estas jornadas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/interno/temporadas"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Temporadas
            </Link>
            <Link
              href="/interno/lanzamiento"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Playbook
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        {loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando…
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <label className="block text-sm font-medium text-white/80">Academia</label>
              <select
                value={selectedAcademyId}
                onChange={(event) => setSelectedAcademyId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
              >
                {academies.map((academy) => (
                  <option key={academy.id} value={academy.id}>
                    {academy.name}
                    {academy.city ? ` · ${academy.city}` : ""}
                  </option>
                ))}
              </select>
              {activeSeason ? (
                <p className="mt-3 text-sm text-emerald-300">
                  Temporada activa: {activeSeason.name}
                </p>
              ) : (
                <p className="mt-3 text-sm text-amber-300">
                  Sin temporada activa — publícala en{" "}
                  <Link href="/interno/temporadas" className="underline">
                    Temporadas
                  </Link>{" "}
                  antes de cargar jornadas.
                </p>
              )}
            </section>

            <FixtureImportSection
              academyId={selectedAcademyId}
              seasonId={activeSeason?.id}
              disabled={!activeSeason}
              onImported={() => void loadFixtures(selectedAcademyId)}
            />

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold">Próximas jornadas</h2>
              {pendingFixtures.length === 0 ? (
                <p className="mt-4 text-sm text-white/55">
                  No hay jornadas pendientes para esta academia.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {pendingFixtures.map((fixture) => (
                    <li
                      key={fixture.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">vs {fixture.opponent}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {formatKickoffDateTime(fixture.kickoff_at, fixture.match_date)}
                          {fixture.category ? ` · ${fixture.category}` : ""}
                        </p>
                        {fixture.venue_name ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/45">
                            <MapPin className="h-3 w-3" />
                            {fixture.venue_name}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => void cancelFixture(fixture.id)}
                        className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10"
                      >
                        Cancelar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-6">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Publicar jornada</h2>
              </div>

              <form onSubmit={handlePublish} className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Rival
                  </label>
                  <input
                    required
                    value={opponent}
                    onChange={(event) => setOpponent(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Halcones FC"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(event) => setMatchDate(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={kickoffTime}
                    onChange={(event) => setKickoffTime(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Categoría
                  </label>
                  <input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Sub-15 Varonil"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Sede / cancha
                  </label>
                  <input
                    value={venueName}
                    onChange={(event) => setVenueName(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Cancha 2 · U.D. Querétaro"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Notas
                  </label>
                  <input
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Uniforme blanco, jornada 3"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={isOfficial}
                    onChange={(event) => setIsOfficial(event.target.checked)}
                    className="rounded border-white/20"
                  />
                  Jornada oficial de torneo
                </label>
                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    className="rounded border-white/20"
                  />
                  Visible en calendario público
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving || !activeSeason}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publicando…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Publicar jornada
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <p className="text-sm text-white/45">
              Ejecuta{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-emerald-200">
                platform-fixtures-rls.sql
              </code>{" "}
              en Supabase para que las academias no puedan crear partidos libres.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
