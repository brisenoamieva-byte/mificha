"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import type { Tournament } from "@/types/database";

type TournamentRow = Tournament & {
  platform_seasons?: { name: string } | null;
};

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

export function TournamentsAdminPanel() {
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [region, setRegion] = useState("Querétaro");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerContact, setOrganizerContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch("/fut/api/interno/tournaments")) as {
        tournaments: TournamentRow[];
      };
      setTournaments(payload.tournaments ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargaron torneos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTournaments();
  }, [loadTournaments]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await authedFetch("/fut/api/interno/tournaments", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          region: region.trim(),
          organizer_name: organizerName.trim() || null,
          organizer_contact: organizerContact.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
          is_active: true,
        }),
      });
      toast.success("Torneo creado.");
      setName("");
      setOrganizerName("");
      setOrganizerContact("");
      setStartDate("");
      setEndDate("");
      await loadTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se creó el torneo.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(tournament: TournamentRow) {
    try {
      await authedFetch("/fut/api/interno/tournaments", {
        method: "PATCH",
        body: JSON.stringify({
          tournament_id: tournament.id,
          is_active: !tournament.is_active,
        }),
      });
      toast.success(tournament.is_active ? "Torneo desactivado." : "Torneo activado.");
      await loadTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se actualizó.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/fut/interno/lanzamiento"
              className="mb-3 inline-flex items-center gap-1 text-sm text-white/55 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Lanzamiento
            </Link>
            <BrandWordmark className="text-xl" />
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Catálogo de torneos</h1>
            <p className="mt-1 max-w-xl text-sm text-white/55">
              Competencias y ligas que alimentan jornadas oficiales. Una temporada de academia
              puede jugar varios torneos.
            </p>
          </div>
          <Link
            href="/fut/interno/jornadas"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Ir a jornadas
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando torneos…
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Registrar torneo</h2>
              </div>
              <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Nombre
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Interescolar Querétaro 2026"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Región
                  </label>
                  <input
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Organizador
                  </label>
                  <input
                    value={organizerName}
                    onChange={(event) => setOrganizerName(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="Nombre del organizador"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Contacto
                  </label>
                  <input
                    value={organizerContact}
                    onChange={(event) => setOrganizerContact(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                    placeholder="WhatsApp o correo"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                    Inicio
                  </label>
                  <input
                    type="date"
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
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f2038] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      "Crear torneo"
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-lg font-semibold">Torneos registrados</h2>
              {tournaments.length === 0 ? (
                <p className="mt-4 text-sm text-white/55">
                  Aún no hay torneos. Crea el primero arriba y luego asígnalo al publicar jornadas.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tournaments.map((tournament) => (
                    <li
                      key={tournament.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{tournament.name}</p>
                        <p className="mt-1 text-sm text-white/55">
                          {tournament.region ?? "Sin región"}
                          {tournament.organizer_name ? ` · ${tournament.organizer_name}` : ""}
                          {tournament.is_active ? " · Activo" : " · Inactivo"}
                        </p>
                        <p className="mt-1 text-xs text-white/40">/{tournament.slug}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleActive(tournament)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5"
                      >
                        {tournament.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-sm text-white/45">
              Ejecuta{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-emerald-200">
                supabase/tournaments-catalog.sql
              </code>{" "}
              en Supabase si la tabla aún no existe.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
