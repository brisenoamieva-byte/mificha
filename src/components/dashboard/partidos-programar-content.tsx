"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { LeagueOfficialBanner } from "@/components/dashboard/league-official-banner";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { toast } from "@/components/ui/toast";
import {
  combineDateAndTimeToIso,
  defaultSeasonName,
} from "@/lib/match-utils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Season } from "@/types/database";

const inputClassName = cn(
  "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900",
  "focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20",
);

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function defaultKickoffTime() {
  return "10:00";
}

export function PartidosProgramarContent() {
  const router = useRouter();
  const { academy } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState(todayIsoDate());
  const [kickoffTime, setKickoffTime] = useState(defaultKickoffTime());
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [seasonName, setSeasonName] = useState(defaultSeasonName());
  const [seasonStart, setSeasonStart] = useState("");
  const [seasonEnd, setSeasonEnd] = useState("");

  const loadSeason = useCallback(async () => {
    if (!academy) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from("seasons")
      .select("*")
      .eq("academy_id", academy.id)
      .eq("is_active", true)
      .maybeSingle();

    setSeason(data);
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    void loadSeason();
  }, [loadSeason]);

  async function ensureSeason(): Promise<Season> {
    if (!academy) throw new Error("Sin academia.");
    if (season) return season;

    if (!seasonStart || !seasonEnd) {
      throw new Error("Indica las fechas de inicio y fin de la temporada.");
    }

    await supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("academy_id", academy.id);

    const { data, error: insertError } = await supabase
      .from("seasons")
      .insert({
        academy_id: academy.id,
        name: seasonName.trim() || defaultSeasonName(),
        start_date: seasonStart,
        end_date: seasonEnd,
        is_active: true,
      })
      .select("*")
      .single();

    if (insertError || !data) throw insertError ?? new Error("No se creó la temporada.");

    setSeason(data);
    return data;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!academy) return;

    setSaving(true);
    setError(null);

    try {
      const activeSeason = await ensureSeason();
      const kickoffAt = combineDateAndTimeToIso(matchDate, kickoffTime);

      const { error: insertError } = await supabase.from("matches").insert({
        season_id: activeSeason.id,
        academy_id: academy.id,
        opponent: opponent.trim(),
        match_date: matchDate,
        kickoff_at: kickoffAt,
        venue_name: venueName.trim() || null,
        venue_address: venueAddress.trim() || null,
        category: category.trim() || null,
        notes: notes.trim() || null,
        is_public: isPublic,
        status: "scheduled",
        result: null,
        goals_for: null,
        goals_against: null,
      });

      if (insertError) throw insertError;

      toast.success(
        isPublic
          ? "Evento publicado en tu calendario MiFicha."
          : "Evento guardado en tu panel.",
      );
      router.push("/dashboard/partidos");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo programar el partido.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!academy) return <NoAcademyState />;

  if (loading) {
    return <p className="text-slate-500">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <Link
        href="/dashboard/partidos"
        className="text-sm font-medium text-[#1B4F8C] hover:underline"
      >
        ← Volver a partidos
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Amistoso o entrenamiento
        </h1>
        <p className="mt-1 text-slate-600">
          Solo para partidos que no están en el calendario oficial de tu liga. Los
          juegos de torneo los publica el organizador — aquí capturas stats después
          de jugar.
        </p>
      </div>

      <LeagueOfficialBanner academy={academy} compact />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        <p className="font-medium text-slate-900">¿Partido de liga o torneo?</p>
        <p className="mt-1">
          No lo dupliques aquí. Enlaza el calendario oficial en Configuración y usa{" "}
          <strong className="font-semibold text-slate-800">Capturar resultado</strong>{" "}
          cuando termine el juego. Si dos escuelas publican el mismo partido por
          separado, padres y scouts verían dos eventos distintos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        {!season ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Crea la temporada activa
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Necesitas una temporada para agrupar el calendario.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  value={seasonName}
                  onChange={(event) => setSeasonName(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Inicio *
                </label>
                <input
                  type="date"
                  required={!season}
                  value={seasonStart}
                  onChange={(event) => setSeasonStart(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Fin *
                </label>
                <input
                  type="date"
                  required={!season}
                  value={seasonEnd}
                  onChange={(event) => setSeasonEnd(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Temporada activa: <strong>{season.name}</strong>
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Rival *
          </label>
          <input
            required
            value={opponent}
            onChange={(event) => setOpponent(event.target.value)}
            className={inputClassName}
            placeholder="Ej. Club Deportivo Águilas"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Hora *
            </label>
            <input
              type="time"
              required
              value={kickoffTime}
              onChange={(event) => setKickoffTime(event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cancha / sede *
          </label>
          <input
            required
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
            className={inputClassName}
            placeholder="Ej. Cancha 2 · Unidad Deportiva..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Dirección
          </label>
          <input
            value={venueAddress}
            onChange={(event) => setVenueAddress(event.target.value)}
            className={inputClassName}
            placeholder="Calle, colonia, ciudad — para abrir en Maps"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClassName}
              placeholder="Ej. Sub-15 Varonil"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Notas
            </label>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={inputClassName}
              placeholder="Ej. Uniforme blanco, llegar 30 min antes"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Mostrar en calendario de MiFicha
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              Solo amistosos o entrenamientos abiertos al público. Los partidos de
              liga deben vivir en el calendario oficial del torneo.
            </span>
          </span>
        </label>

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B4F8C] px-5 py-4 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-60"
        >
          <CalendarPlus className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar evento"}
        </button>
      </form>
    </div>
  );
}
