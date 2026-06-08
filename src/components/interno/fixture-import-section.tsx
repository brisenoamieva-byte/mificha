"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import {
  downloadFixtureImportTemplate,
  parseFixtureImportFile,
  type FixtureImportPreview,
} from "@/lib/fixture-import";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

interface FixtureImportSectionProps {
  academyId: string;
  seasonId: string | undefined;
  disabled?: boolean;
  onImported: () => void;
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

  const payload = (await response.json()) as { error?: string; inserted?: number };

  if (!response.ok) {
    throw new Error(payload.error ?? "Error de red.");
  }

  return payload;
}

export function FixtureImportSection({
  academyId,
  seasonId,
  disabled,
  onImported,
}: FixtureImportSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<FixtureImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isOfficial, setIsOfficial] = useState(true);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const nextPreview = parseFixtureImportFile(buffer);
      setPreview(nextPreview);

      if (nextPreview.valid.length === 0) {
        toast.error("No se encontraron filas válidas en el archivo.");
      } else {
        toast.success(
          `${nextPreview.valid.length} jornada${nextPreview.valid.length === 1 ? "" : "s"} listas para importar.`,
        );
      }
    } catch {
      toast.error("No se pudo leer el archivo.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleImport() {
    if (!preview || preview.valid.length === 0 || !academyId) return;

    setImporting(true);
    try {
      const result = await authedFetch("/api/interno/fixtures/bulk", {
        method: "POST",
        body: JSON.stringify({
          academy_id: academyId,
          season_id: seasonId,
          is_public: isPublic,
          is_official: isOfficial,
          fixtures: preview.valid.map((row) => ({
            opponent: row.opponent,
            match_date: row.matchDate,
            kickoff_time: row.kickoffTime,
            venue_name: row.venueName,
            venue_address: row.venueAddress,
            category: row.category,
            notes: row.notes,
          })),
        }),
      });

      toast.success(`${result.inserted ?? preview.valid.length} jornadas publicadas.`);
      setPreview(null);
      onImported();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se importó el calendario.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-sky-300" />
            <h2 className="text-lg font-semibold">Importar calendario</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Sube CSV o Excel con columnas: rival, fecha, hora, categoría, sede,
            notas. Ideal para cargar toda la jornada del torneo de una vez.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadFixtureImportTemplate}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          Plantilla CSV
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          Elegir archivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
        <label className="flex items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={isOfficial}
            onChange={(event) => setIsOfficial(event.target.checked)}
            className="rounded border-white/20"
          />
          Oficial
        </label>
        <label className="flex items-center gap-2 text-sm text-white/75">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="rounded border-white/20"
          />
          Público
        </label>
      </div>

      {preview ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-200">
              {preview.valid.length} válidas
            </span>
            {preview.invalid.length > 0 ? (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-amber-200">
                {preview.invalid.length} con error
              </span>
            ) : null}
          </div>

          {preview.valid.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/20 text-xs uppercase tracking-wide text-white/45">
                  <tr>
                    <th className="px-4 py-3">Rival</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Sede</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.valid.slice(0, 8).map((row) => (
                    <tr key={row.rowNumber} className="border-t border-white/10">
                      <td className="px-4 py-3 font-medium">{row.opponent}</td>
                      <td className="px-4 py-3 text-white/70">{row.matchDate}</td>
                      <td className="px-4 py-3 text-white/70">{row.kickoffTime}</td>
                      <td className="px-4 py-3 text-white/70">{row.category ?? "—"}</td>
                      <td className="px-4 py-3 text-white/70">{row.venueName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {preview.invalid.length > 0 ? (
            <ul className="space-y-2 text-sm text-amber-200/90">
              {preview.invalid.slice(0, 5).map((row) => (
                <li key={row.rowNumber}>
                  Fila {row.rowNumber}: {row.reason}
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            disabled={importing || disabled || preview.valid.length === 0}
            onClick={() => void handleImport()}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-60"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando…
              </>
            ) : (
              <>Publicar {preview.valid.length} jornadas</>
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}
