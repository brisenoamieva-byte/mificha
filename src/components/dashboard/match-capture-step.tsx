"use client";

import { Users, Zap } from "lucide-react";
import {
  MinuteQuickInput,
  MinuteRolePresets,
  QuickGoalPicker,
} from "@/components/dashboard/match-stat-capture";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { getPositionLabel } from "@/lib/dashboard-utils";
import type { CaptureStyle, PlayerCapture, RosterListMode } from "@/lib/match-capture";
import type { AcademyCaptureScope } from "@/lib/match-data-governance";
import { applyCapturePatch } from "@/lib/match-capture";
import type { Player } from "@/types/database";
import { cn } from "@/lib/utils";

interface MatchCaptureStepProps {
  opponent: string;
  captureStyle: CaptureStyle;
  listMode: RosterListMode;
  convocadoIds: string[];
  visiblePlayers: Player[];
  captures: PlayerCapture[];
  rosterCategoryLabel: string | null;
  scheduledMatchCategory: string | null;
  playedCount: number;
  academyCaptureScope?: AcademyCaptureScope;
  onCaptureStyleChange: (style: CaptureStyle) => void;
  onListModeChange: (mode: RosterListMode) => void;
  onToggleConvocado: (playerId: string) => void;
  onSelectAllConvocados: () => void;
  onClearConvocados: () => void;
  onEditConvocados: () => void;
  onBulkMinutes: (minutes: number) => void;
  onUpdateCapture: (playerId: string, patch: Partial<PlayerCapture>) => void;
}

export function MatchCaptureStep({
  opponent,
  captureStyle,
  listMode,
  convocadoIds,
  visiblePlayers,
  captures,
  rosterCategoryLabel,
  scheduledMatchCategory,
  playedCount,
  academyCaptureScope = "full",
  onCaptureStyleChange,
  onListModeChange,
  onToggleConvocado,
  onSelectAllConvocados,
  onClearConvocados,
  onEditConvocados,
  onBulkMinutes,
  onUpdateCapture,
}: MatchCaptureStepProps) {
  const captureTargets =
    listMode === "convocados"
      ? visiblePlayers.filter((player) => convocadoIds.includes(player.id))
      : visiblePlayers;

  const showConvocadoPicker =
    listMode === "convocados" && convocadoIds.length === 0 && visiblePlayers.length > 0;

  const rosterMinutesOnly = academyCaptureScope === "roster_minutes";

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Stats por jugador</h1>
        <p className="mt-1 text-slate-600">Paso 2 de 2 · vs {opponent}</p>
        <p className="mt-3 text-sm text-slate-500">
          {rosterMinutesOnly
            ? "Marca convocados y minutos. Goles y tarjetas los publica el organizador en el acta oficial."
            : "Marca convocados, captura minutos, guarda y MiFicha avisa al tutor automáticamente."}
        </p>

        {rosterCategoryLabel ? (
          <p className="mt-3 rounded-xl bg-[#1B4F8C]/10 px-4 py-3 text-sm text-[#1B4F8C]">
            Plantel filtrado: {rosterCategoryLabel}
            {scheduledMatchCategory ? ` (${scheduledMatchCategory})` : ""}.
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!rosterMinutesOnly ? (
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onCaptureStyleChange("quick")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  captureStyle === "quick"
                    ? "bg-white text-[#1B4F8C] shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Zap className="h-4 w-4" />
                Rápida (~1 min)
              </button>
              <button
                type="button"
                onClick={() => onCaptureStyleChange("detailed")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  captureStyle === "detailed"
                    ? "bg-white text-[#1B4F8C] shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                Detallada
              </button>
            </div>
          ) : null}

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onListModeChange("convocados")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
                listMode === "convocados"
                  ? "bg-white text-mf-accent-dark shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Users className="h-4 w-4" />
              Convocados ({convocadoIds.length})
            </button>
            <button
              type="button"
              onClick={() => onListModeChange("all")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                listMode === "all"
                  ? "bg-white text-[#1B4F8C] shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              Todo el plantel
            </button>
          </div>
        </div>

        {listMode === "convocados" && convocadoIds.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onBulkMinutes(90)}
              className="rounded-lg border border-mf-accent-muted bg-mf-accent-soft px-3 py-1.5 text-xs font-semibold text-mf-accent-dark hover:bg-mf-accent-muted"
            >
              Todos titular 90
            </button>
            <button
              type="button"
              onClick={() => onBulkMinutes(45)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Todos 2° tiempo 45
            </button>
            <button
              type="button"
              onClick={onClearConvocados}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Limpiar convocados
            </button>
          </div>
        ) : null}
      </div>

      {visiblePlayers.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            Agrega jugadores en Mi Plantel primero.
          </p>
        </div>
      ) : showConvocadoPicker ? (
        <div className="rounded-2xl border border-dashed border-mf-accent/40 bg-mf-accent-soft/30 p-5 shadow-sm">
          <p className="font-semibold text-slate-900">¿Quién jugó hoy?</p>
          <p className="mt-1 text-sm text-slate-600">
            Toca a los convocados. Solo ellos aparecerán en la captura.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSelectAllConvocados}
              className="rounded-lg bg-[#1B4F8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#164278]"
            >
              Marcar todos visibles
            </button>
            <button
              type="button"
              onClick={() => onListModeChange("all")}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
            >
              Ver plantel completo
            </button>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {visiblePlayers.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => onToggleConvocado(player.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-mf-accent/40 hover:bg-mf-accent-soft/40"
                >
                  <PlayerAvatar
                    firstName={player.first_name}
                    lastName={player.last_name}
                    photoUrl={player.photo_url}
                    size="sm"
                  />
                  <span className="truncate text-sm font-medium text-slate-900">
                    {player.first_name} {player.last_name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          {listMode === "convocados" ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>
                {captureTargets.length} convocado
                {captureTargets.length === 1 ? "" : "s"} · {playedCount} con minutos
              </span>
              <button
                type="button"
                onClick={onEditConvocados}
                className="font-semibold text-[#1B4F8C] hover:underline"
              >
                Editar lista
              </button>
            </div>
          ) : null}

          {captureTargets.map((player) => {
            const capture = captures.find((item) => item.player_id === player.id);
            if (!capture) return null;

            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm",
                  capture.played
                    ? "border-[#1B4F8C]/30 ring-1 ring-[#1B4F8C]/10"
                    : "border-slate-200",
                )}
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar
                    firstName={player.first_name}
                    lastName={player.last_name}
                    photoUrl={player.photo_url}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getPositionLabel(player.position)} · Passport{" "}
                      {player.passport_score}
                    </p>
                  </div>
                  {listMode === "convocados" ? (
                    <button
                      type="button"
                      onClick={() => onToggleConvocado(player.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-red-600"
                    >
                      Quitar
                    </button>
                  ) : null}
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={capture.played}
                      onChange={(event) =>
                        onUpdateCapture(player.id, {
                          played: event.target.checked,
                          minutes: event.target.checked
                            ? capture.minutes || (captureStyle === "quick" ? 60 : 45)
                            : 0,
                          goals: event.target.checked ? capture.goals : 0,
                          assists: event.target.checked ? capture.assists : 0,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Jugó
                  </label>
                </div>

                {captureStyle === "quick" || rosterMinutesOnly ? (
                  <MinuteRolePresets
                    className="mt-4"
                    disabled={!capture.played}
                    value={capture.minutes}
                    onChange={(minutes) =>
                      onUpdateCapture(player.id, { played: true, minutes })
                    }
                  />
                ) : (
                  <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <QuickGoalPicker
                        label="Goles"
                        value={capture.goals}
                        max={3}
                        disabled={!capture.played}
                        onChange={(value) =>
                          onUpdateCapture(player.id, { goals: value })
                        }
                      />
                      <QuickGoalPicker
                        label="Asistencias"
                        value={capture.assists}
                        max={3}
                        disabled={!capture.played}
                        onChange={(value) =>
                          onUpdateCapture(player.id, { assists: value })
                        }
                      />
                      <MinuteQuickInput
                        value={capture.minutes}
                        disabled={!capture.played}
                        onChange={(value) =>
                          onUpdateCapture(player.id, { minutes: value })
                        }
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!capture.played}
                        onClick={() =>
                          onUpdateCapture(player.id, {
                            yellow: !capture.yellow,
                          })
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
                          capture.yellow
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-200",
                        )}
                      >
                        🟨 Amarilla
                      </button>
                      <button
                        type="button"
                        disabled={!capture.played}
                        onClick={() =>
                          onUpdateCapture(player.id, {
                            red: !capture.red,
                          })
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
                          capture.red
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200",
                        )}
                      >
                        🟥 Roja
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {listMode === "convocados" && captureTargets.length > 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">Agregar convocado</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {visiblePlayers
                  .filter((player) => !convocadoIds.includes(player.id))
                  .slice(0, 8)
                  .map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => onToggleConvocado(player.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-mf-accent/40 hover:bg-mf-accent-soft"
                    >
                      + {player.first_name}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function updateCapturesList(
  captures: PlayerCapture[],
  playerId: string,
  patch: Partial<PlayerCapture>,
): PlayerCapture[] {
  return captures.map((item) =>
    item.player_id === playerId ? applyCapturePatch(item, patch) : item,
  );
}
