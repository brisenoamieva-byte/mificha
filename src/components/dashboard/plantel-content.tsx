"use client";

import {
  Download,
  ExternalLink,
  FileSpreadsheet,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlayerModal } from "@/components/PlayerModal";
import { PlayerImportModal } from "@/components/dashboard/player-import-modal";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { PassportBar } from "@/components/ui/passport-bar";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { PositionBadge } from "@/components/ui/position-badge";
import { SharePlayerButton } from "@/components/ui/share-player-button";
import { toast } from "@/components/ui/toast";
import { MiniStatCard } from "@/components/ui/visual-stats";
import { CategoryFilterSelect } from "@/components/ui/category-filter-select";
import { PlayerCategoryBadge } from "@/components/ui/player-category-badge";
import { calculateAge } from "@/lib/dashboard-utils";
import {
  matchesCategoryFilter,
  parseCategoryFilter,
} from "@/lib/player-category";
import { getAveragePassportScore } from "@/lib/stats-analytics";
import { downloadPlayerImportTemplate } from "@/lib/excel-import";
import {
  getDominantFootLabel,
  isProfileComplete,
  positionOptions,
} from "@/lib/player-utils";
import { supabase } from "@/lib/supabase";
import type { Player, PlayerPosition } from "@/types/database";

const PAGE_SIZE = 10;

export function PlantelContent() {
  const { academy } = useDashboard();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | "all">(
    "all",
  );
  const [profileFilter, setProfileFilter] = useState<"all" | "complete" | "incomplete">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const loadPlayers = useCallback(async () => {
    if (!academy) return;

    setLoading(true);
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("academy_id", academy.id)
      .order("last_name", { ascending: true });

    setPlayers(data ?? []);
    setLoading(false);
  }, [academy]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const filteredPlayers = useMemo(() => {
    const category = parseCategoryFilter(categoryFilter);

    return players.filter((player) => {
      const matchesPosition =
        positionFilter === "all" || player.position === positionFilter;
      const complete = isProfileComplete(player);
      const matchesProfile =
        profileFilter === "all" ||
        (profileFilter === "complete" && complete) ||
        (profileFilter === "incomplete" && !complete);

      return (
        matchesPosition &&
        matchesProfile &&
        matchesCategoryFilter(player.birth_date, category)
      );
    });
  }, [players, positionFilter, profileFilter, categoryFilter]);

  const plantelBirthDates = useMemo(
    () => players.map((player) => player.birth_date),
    [players],
  );

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const paginatedPlayers = filteredPlayers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const passportAverage = useMemo(
    () => getAveragePassportScore(players.map((player) => player.passport_score)),
    [players],
  );

  const topPassportPlayer = useMemo(
    () =>
      [...players].sort((a, b) => b.passport_score - a.passport_score)[0] ??
      null,
    [players],
  );

  const guardiansWithContactCount = useMemo(
    () =>
      players.filter(
        (player) =>
          player.guardian_email?.trim() || player.guardian_phone?.trim(),
      ).length,
    [players],
  );

  const publicProfilesCount = useMemo(
    () => players.filter((player) => player.is_public).length,
    [players],
  );

  useEffect(() => {
    setPage(1);
  }, [positionFilter, profileFilter, categoryFilter]);

  async function handleDelete(player: Player) {
    const confirmed = window.confirm(
      `¿Eliminar a ${player.first_name} ${player.last_name}?`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("players").delete().eq("id", player.id);
    if (error) {
      toast.error("No se pudo eliminar el jugador.");
      return;
    }

    toast.success("Jugador eliminado.");
    await loadPlayers();
  }

  if (!academy) {
    return <NoAcademyState />;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Mi Plantel
            </h1>
            <p className="mt-1 text-slate-600">
              {players.length} jugador{players.length === 1 ? "" : "es"} · la
              academia registra el plantel; los padres solo ven la ficha por link
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/plantel/tutores"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" />
              Avisos a tutores
            </Link>
            <button
              type="button"
              onClick={downloadPlayerImportTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Plantilla Excel
            </button>
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importar plantel
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPlayer(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164278]"
            >
              <Plus className="h-4 w-4" />
              Nuevo jugador
            </button>
          </div>
        </div>

        {players.length === 0 && !loading ? (
          <div className="rounded-xl border border-[#1B4F8C]/20 bg-[#1B4F8C]/5 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Primer paso: carga tu plantel
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>Descarga la plantilla Excel (incluye columnas opcionales de tutor).</li>
              <li>Importa todo el roster (ideal al inicio de temporada).</li>
              <li>Filtra por generación o Sub-X y completa foto, video y consentimiento.</li>
              <li>Registra contacto del tutor y envía el link desde Avisos a tutores.</li>
            </ol>
          </div>
        ) : null}

        {players.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStatCard
              label="Passport promedio"
              value={passportAverage}
              hint="Salud general del plantel"
            />
            <MiniStatCard
              label="Mejor PASSPORT"
              value={topPassportPlayer?.passport_score ?? 0}
              hint={
                topPassportPlayer
                  ? `${topPassportPlayer.first_name} ${topPassportPlayer.last_name}`
                  : "Sin jugadores"
              }
              tone="green"
            />
            <MiniStatCard
              label="Tutores con contacto"
              value={guardiansWithContactCount}
              hint={`${publicProfilesCount} fichas públicas · avisos en /tutores`}
              tone="amber"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid lg:grid-cols-3">
          <CategoryFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            birthDates={plantelBirthDates}
            selectClassName="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={positionFilter}
            onChange={(event) =>
              setPositionFilter(event.target.value as PlayerPosition | "all")
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">Todas las posiciones</option>
            {positionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={profileFilter}
            onChange={(event) =>
              setProfileFilter(
                event.target.value as "all" | "complete" | "incomplete",
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">Todos los perfiles</option>
            <option value="complete">Perfil completo</option>
            <option value="incomplete">Perfil incompleto</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <UserPlus className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Sin jugadores
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Descarga la plantilla, importa tu roster o agrega jugadores uno a uno.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={downloadPlayerImportTemplate}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Plantilla
                </button>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1B4F8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164278]"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Importar plantel
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-4 font-medium sm:px-6">Jugador</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Categoría</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Edad</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Posición</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Pie</th>
                    <th className="px-4 py-4 font-medium sm:px-6">PASSPORT</th>
                    <th className="px-4 py-4 font-medium sm:px-6">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            firstName={player.first_name}
                            lastName={player.last_name}
                            photoUrl={player.photo_url}
                          />
                          <div>
                            <p className="font-medium text-slate-900">
                              {player.first_name} {player.last_name}
                            </p>
                            {!isProfileComplete(player) ? (
                              <p className="text-xs text-amber-600">Incompleto</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <PlayerCategoryBadge birthDate={player.birth_date} compact />
                      </td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">
                        {calculateAge(player.birth_date)} años
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <PositionBadge position={player.position} />
                      </td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">
                        {getDominantFootLabel(player.dominant_foot)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <PassportBar score={player.passport_score} />
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <SharePlayerButton
                            slug={player.slug}
                            firstName={player.first_name}
                            lastName={player.last_name}
                            isPublic={player.is_public}
                            publicConsentAt={player.public_consent_at}
                            compact
                          />
                          <Link
                            href={`/j/${player.slug}`}
                            target="_blank"
                            className="rounded-lg p-2 text-[#1B4F8C] hover:bg-slate-100"
                            title="Ver ficha"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlayer(player);
                              setModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(player)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredPlayers.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <PlayerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        academyId={academy.id}
        player={editingPlayer}
        onSaved={(message) => {
          toast.success(message);
          loadPlayers();
        }}
      />

      <PlayerImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        academyId={academy.id}
        onImported={(count) => {
          toast.success(
            `${count} jugador${count === 1 ? "" : "es"} importado${count === 1 ? "" : "s"} como fichas privadas.`,
          );
          loadPlayers();
        }}
      />

    </>
  );
}
