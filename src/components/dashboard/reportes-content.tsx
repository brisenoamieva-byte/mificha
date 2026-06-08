"use client";

import Link from "next/link";
import { AlertTriangle, Mail, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { ComparativeReportPanel } from "@/components/dashboard/comparative-report-panel";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { toast } from "@/components/ui/toast";
import { buildReportEmailHtml } from "@/lib/email/report-template";
import { emptySeasonStats, wasSentThisWeek } from "@/lib/email/report-utils";
import {
  getCategoryFilterLabel,
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { EmailLog, Player, PlayerSeasonStat, Season } from "@/types/database";

interface EmailLogRow extends EmailLog {
  players: Pick<Player, "first_name" | "last_name"> | null;
}

interface ReportesContentProps {
  embedded?: boolean;
}

export function ReportesContent({ embedded = false }: ReportesContentProps) {
  const { academy } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasonStats, setSeasonStats] = useState<PlayerSeasonStat[]>([]);
  const [logs, setLogs] = useState<EmailLogRow[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [emailReady, setEmailReady] = useState<boolean | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!academy) return;

    setLoading(true);

    const [{ data: seasonData }, { data: playerData }, { data: logData }] =
      await Promise.all([
        supabase
          .from("seasons")
          .select("*")
          .eq("academy_id", academy.id)
          .order("start_date", { ascending: false }),
        supabase
          .from("players")
          .select("*")
          .eq("academy_id", academy.id)
          .order("last_name", { ascending: true }),
        supabase
          .from("email_logs")
          .select("*, players(first_name, last_name)")
          .eq("academy_id", academy.id)
          .order("sent_at", { ascending: false })
          .limit(50),
      ]);

    const nextSeasons = seasonData ?? [];
    const nextPlayers = playerData ?? [];

    setSeasons(nextSeasons);
    setPlayers(nextPlayers);
    setLogs((logData ?? []) as EmailLogRow[]);
    setSelectedPlayerId((current) => current || nextPlayers[0]?.id || "");

    const activeSeason =
      nextSeasons.find((season) => season.is_active) ?? nextSeasons[0] ?? null;

    setSelectedSeasonId((current) => current || activeSeason?.id || "");

    if (activeSeason?.id || nextSeasons[0]?.id) {
      const seasonId = activeSeason?.id ?? nextSeasons[0]?.id;
      const { data: statsData } = await supabase
        .from("player_season_stats")
        .select("*")
        .eq("season_id", seasonId ?? "");

      setSeasonStats(statsData ?? []);
    } else {
      setSeasonStats([]);
    }

    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    async function loadEmailStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/platform/email-status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) return;

      const data = (await response.json()) as { ready?: boolean; hint?: string | null };
      setEmailReady(data.ready ?? false);
      setEmailHint(data.hint ?? null);
    }

    void loadEmailStatus();
  }, []);

  useEffect(() => {
    async function loadSeasonStats() {
      if (!selectedSeasonId) {
        setSeasonStats([]);
        return;
      }

      const { data } = await supabase
        .from("player_season_stats")
        .select("*")
        .eq("season_id", selectedSeasonId);

      setSeasonStats(data ?? []);
    }

    loadSeasonStats();
  }, [selectedSeasonId]);

  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId);

  const birthDates = useMemo(
    () => players.map((player) => player.birth_date),
    [players],
  );

  const filteredPlayers = useMemo(() => {
    const category = parseCategoryFilter(categoryFilter);
    return players.filter((player) =>
      matchesCategoryFilter(player.birth_date, category),
    );
  }, [players, categoryFilter]);

  const filteredSeasonStats = useMemo(() => {
    const ids = new Set(filteredPlayers.map((player) => player.id));
    return seasonStats.filter((stat) => ids.has(stat.player_id));
  }, [filteredPlayers, seasonStats]);

  const categoryLabel = getCategoryFilterLabel(parseCategoryFilter(categoryFilter));

  const previewPlayer =
    filteredPlayers.find((player) => player.id === selectedPlayerId) ??
    filteredPlayers[0] ??
    null;

  useEffect(() => {
    if (
      selectedPlayerId &&
      filteredPlayers.some((player) => player.id === selectedPlayerId)
    ) {
      return;
    }

    setSelectedPlayerId(filteredPlayers[0]?.id ?? "");
  }, [filteredPlayers, selectedPlayerId]);

  const previewStats = useMemo(() => {
    if (!previewPlayer) return emptySeasonStats();

    return (
      seasonStats.find((item) => item.player_id === previewPlayer.id) ??
      emptySeasonStats()
    );
  }, [previewPlayer, seasonStats]);

  const previewHtml = useMemo(() => {
    if (!previewPlayer || !selectedSeason || !academy) return "";

    return buildReportEmailHtml({
      playerFirstName: previewPlayer.first_name,
      playerLastName: previewPlayer.last_name,
      playerPhotoUrl: previewPlayer.photo_url,
      playerSlug: previewPlayer.slug,
      passportScore: previewPlayer.passport_score,
      seasonName: selectedSeason.name,
      stats: {
        total_matches: previewStats.total_matches,
        total_goals: previewStats.total_goals,
        total_assists: previewStats.total_assists,
        total_minutes: previewStats.total_minutes,
        total_yellow_cards: previewStats.total_yellow_cards,
        total_red_cards: previewStats.total_red_cards,
      },
      academyName: academy.name,
    });
  }, [academy, previewPlayer, previewStats, selectedSeason]);

  const sentThisWeek = useMemo(() => {
    return logs.some(
      (log) => log.status === "sent" && wasSentThisWeek(log.sent_at),
    );
  }, [logs]);

  const playersWithGuardianEmail = useMemo(
    () => filteredPlayers.filter((player) => player.guardian_email?.trim()),
    [filteredPlayers],
  );

  async function handleSendReports() {
    if (!academy || !selectedSeasonId) return;

    const confirmed = window.confirm(
      sentThisWeek
        ? "Ya enviaste reportes esta semana. ¿Quieres intentarlo de nuevo?"
        : `¿Enviar reportes a ${playersWithGuardianEmail.length} tutor${playersWithGuardianEmail.length === 1 ? "" : "es"} con email registrado?`,
    );

    if (!confirmed) return;

    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Tu sesión expiró. Vuelve a iniciar sesión.");
        return;
      }

      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          academy_id: academy.id,
          season_id: selectedSeasonId,
        }),
      });

      const result = (await response.json()) as {
        sent: number;
        failed: number;
        errors: string[];
      };

      if (!response.ok && result.sent === 0) {
        toast.error(result.errors[0] ?? "No se pudieron enviar los reportes.");
        return;
      }

      toast.success(
        `Reportes enviados: ${result.sent}. Fallidos: ${result.failed}.`,
      );
      await loadData();
    } catch {
      toast.error("Error de red al enviar reportes.");
    } finally {
      setSending(false);
    }
  }

  if (!academy) {
    return <NoAcademyState />;
  }

  if (loading) {
    return (
      <div className={embedded ? "space-y-6" : "mx-auto max-w-6xl space-y-6"}>
        {!embedded ? <Skeleton className="h-10 w-64" /> : null}
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-6xl space-y-6"}>
      {!embedded ? (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Reportes a padres
          </h1>
          <p className="mt-1 text-slate-600">
            Comparativas visuales del plantel y envío del resumen mensual verificado.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Máximo 1 reporte por jugador por semana.</p>
        </div>
      </div>

      {emailReady === false && emailHint ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
              <div>
                <p className="font-medium text-slate-900">Reportes por email en configuración</p>
                <p className="mt-1 leading-6">{emailHint}</p>
              </div>
            </div>
            <Link
              href="/dashboard/plantel"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Ir a Plantel
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <CategoryFilterSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          birthDates={birthDates}
          hint={
            embedded
              ? "Filtra a qué tutores enviar según categoría."
              : "La comparativa usa el promedio de la categoría seleccionada — contexto, no castigo."
          }
        />
      </div>

      {!embedded ? (
        <ComparativeReportPanel
          players={filteredPlayers}
          seasonStats={filteredSeasonStats}
          selectedPlayerId={previewPlayer?.id ?? ""}
          onSelectPlayer={setSelectedPlayerId}
          seasonName={selectedSeason?.name}
          categoryLabel={categoryLabel}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Temporada</span>
            <select
              value={selectedSeasonId}
              onChange={(event) => setSelectedSeasonId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1B4F8C] focus:ring-2 focus:ring-[#1B4F8C]/20"
            >
              {seasons.length === 0 ? (
                <option value="">Sin temporadas</option>
              ) : (
                seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                    {season.is_active ? " (activa)" : ""}
                  </option>
                ))
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSendReports}
            disabled={
              sending ||
              !selectedSeasonId ||
              playersWithGuardianEmail.length === 0
            }
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
              sentThisWeek
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700",
            )}
          >
            <Send className="h-4 w-4" />
            {sending ? "Enviando..." : "Enviar a todos los padres"}
          </button>

          <p className="text-xs leading-relaxed text-slate-500">
            {playersWithGuardianEmail.length} de {filteredPlayers.length} jugadores
            en esta categoría tienen email del tutor en Plantel.
            {categoryLabel ? ` (${categoryLabel})` : ""}
          </p>

          {filteredPlayers.length > 0 && playersWithGuardianEmail.length === 0 ? (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Edita cada jugador y agrega el email del padre o tutor en Contacto.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#1B4F8C]" />
              <h2 className="font-semibold text-slate-900">Vista previa del email</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {previewPlayer
                ? `Ejemplo con ${previewPlayer.first_name} ${previewPlayer.last_name}`
                : "Agrega jugadores al plantel para ver la vista previa."}
            </p>
          </div>

          {previewHtml ? (
            <iframe
              title="Vista previa del reporte"
              srcDoc={previewHtml}
              className="h-[520px] w-full rounded-b-2xl bg-slate-100"
            />
          ) : (
            <div className="flex h-[520px] items-center justify-center rounded-b-2xl bg-slate-50 px-6 text-center text-sm text-slate-500">
              No hay jugadores para generar la vista previa.
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Historial de envíos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Jugador</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Aún no hay reportes enviados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {log.players
                        ? `${log.players.first_name} ${log.players.last_name}`
                        : "Jugador"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{log.recipient_email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          log.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {log.status === "sent" ? "Enviado" : "Fallido"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(log.sent_at).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
