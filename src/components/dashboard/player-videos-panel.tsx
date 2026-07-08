"use client";

import { Film, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  addPlayerVideo,
  deletePlayerVideo,
  fetchPlayerVideos,
  PLAYER_VIDEO_TITLE_PRESETS,
} from "@/lib/player-videos";
import type { PlayerVideo } from "@/types/database";

interface PlayerVideosPanelProps {
  academyId: string;
  playerId: string | null;
  primaryVideoUrl: string | null;
  onPrimaryVideoChange: (file: File | null) => void;
  primaryVideoPreview: string | null;
}

export function PlayerVideosPanel({
  academyId,
  playerId,
  primaryVideoUrl,
  onPrimaryVideoChange,
  primaryVideoPreview,
}: PlayerVideosPanelProps) {
  const [clips, setClips] = useState<PlayerVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState<string>(PLAYER_VIDEO_TITLE_PRESETS[0]);
  const [customTitle, setCustomTitle] = useState("");
  const [clipFile, setClipFile] = useState<File | null>(null);

  const loadClips = useCallback(async () => {
    if (!playerId) {
      setClips([]);
      return;
    }

    setLoading(true);
    try {
      setClips(await fetchPlayerVideos(playerId));
    } catch {
      toast.error("No se pudieron cargar los videos del jugador.");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    void loadClips();
  }, [loadClips]);

  async function handleAddClip() {
    if (!playerId) {
      toast.error("Guarda el jugador primero para agregar clips adicionales.");
      return;
    }

    if (!clipFile) {
      toast.error("Selecciona un archivo de video.");
      return;
    }

    const resolvedTitle =
      title === "Otro" ? customTitle.trim() : title;

    if (!resolvedTitle) {
      toast.error("Escribe un título para el clip.");
      return;
    }

    setUploading(true);
    try {
      const row = await addPlayerVideo({
        academyId,
        playerId,
        title: resolvedTitle,
        file: clipFile,
        sortOrder: clips.length,
      });
      setClips((current) => [...current, row]);
      setClipFile(null);
      setCustomTitle("");
      toast.success("Video promocional agregado.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo subir el video.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteClip(videoId: string) {
    if (!window.confirm("¿Eliminar este video?")) return;

    try {
      await deletePlayerVideo(videoId);
      setClips((current) => current.filter((row) => row.id !== videoId));
      toast.success("Video eliminado.");
    } catch {
      toast.error("No se pudo eliminar el video.");
    }
  }

  const previewSrc =
    primaryVideoPreview?.startsWith("blob:") ||
    primaryVideoPreview?.startsWith("http")
      ? primaryVideoPreview
      : primaryVideoUrl;

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Videos promocionales</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          La academia sube el material (highlights, goles, entrenamiento). Los padres
          pueden enviarte clips por WhatsApp; tú los publicas aquí con consentimiento.
          Visores y familias los ven en la ficha pública.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">
          Video principal (max 50 MB)
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onPrimaryVideoChange(file);
          }}
          className="mt-2 block w-full text-sm text-slate-600"
        />
        {previewSrc ? (
          <video
            controls
            className="mt-3 max-h-48 w-full rounded-lg bg-black"
            src={previewSrc}
          />
        ) : null}
      </div>

      {playerId ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-800">Clips adicionales</p>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando videos…</p>
          ) : clips.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay clips extra. Agrega goles, regates o partido completo.
            </p>
          ) : (
            <ul className="space-y-3">
              {clips.map((clip) => (
                <li
                  key={clip.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{clip.title}</p>
                    <video
                      controls
                      className="mt-2 max-h-40 w-full rounded-lg bg-black"
                      src={clip.video_url}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClip(clip.id)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Tipo</label>
              <select
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {PLAYER_VIDEO_TITLE_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
                <option value="Otro">Otro título…</option>
              </select>
            </div>
            {title === "Otro" ? (
              <div>
                <label className="block text-xs font-medium text-slate-600">Título</label>
                <input
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder="Ej. Hat-trick vs Atlas"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            ) : null}
          </div>

          <input
            type="file"
            accept="video/*"
            onChange={(event) => setClipFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600"
          />

          <button
            type="button"
            disabled={uploading || !clipFile}
            onClick={handleAddClip}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B4F8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {uploading ? "Subiendo…" : "Agregar clip"}
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
          <Film className="mt-0.5 h-4 w-4 shrink-0" />
          Guarda el jugador una vez para agregar clips adicionales además del video principal.
        </div>
      )}
    </div>
  );
}
