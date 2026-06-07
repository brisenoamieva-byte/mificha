"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle2, FileSpreadsheet, X } from "lucide-react";
import { useState } from "react";
import { getPositionLabel } from "@/lib/dashboard-utils";
import {
  importParsedPlayers,
  previewPlayersFromExcel,
  type PlayerImportPreview,
} from "@/lib/excel-import";
import { formatPlayerCategory } from "@/lib/player-category";
import { cn } from "@/lib/utils";

interface PlayerImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academyId: string;
  onImported: (count: number) => void;
}

export function PlayerImportModal({
  open,
  onOpenChange,
  academyId,
  onImported,
}: PlayerImportModalProps) {
  const [preview, setPreview] = useState<PlayerImportPreview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetState() {
    setPreview(null);
    setFileName(null);
    setLoading(false);
    setImporting(false);
    setError(null);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const nextPreview = await previewPlayersFromExcel(file);
      setPreview(nextPreview);
      setFileName(file.name);
    } catch (previewError) {
      setPreview(null);
      setFileName(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "No se pudo leer el archivo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmImport() {
    if (!preview || preview.valid.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const count = await importParsedPlayers(preview.valid, academyId);
      onImported(count);
      onOpenChange(false);
      resetState();
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Error al importar jugadores.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-slate-900">
                Importar plantel
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Sube tu roster completo al inicio de temporada. Opcional: columnas
                «nombre tutor» y «email tutor» para reportes a padres.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
              <FileSpreadsheet className="h-8 w-8 text-[#1B4F8C]" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {loading ? "Leyendo archivo..." : "Selecciona Excel o CSV"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Columnas: nombre, apellido, fecha nacimiento, posición, pierna
                  (opcional: número, estatura, peso)
                </p>
              </div>
              <span className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1B4F8C] ring-1 ring-slate-200">
                Elegir archivo
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={loading || importing}
                onChange={handleFileChange}
              />
            </label>
            {fileName ? (
              <p className="mt-4 text-center text-xs text-slate-500">{fileName}</p>
            ) : null}
          </div>

          {preview ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Listos
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-800">
                    {preview.valid.length}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                    Con error
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-800">
                    {preview.invalid.length}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    Filas leídas
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-800">
                    {preview.totalRows}
                  </p>
                </div>
              </div>

              {preview.valid.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Vista previa (primeros 8)
                  </p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Jugador</th>
                          <th className="px-4 py-3 font-medium">Categoría</th>
                          <th className="px-4 py-3 font-medium">Posición</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.valid.slice(0, 8).map((row) => (
                          <tr
                            key={row.rowNumber}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {row.firstName} {row.lastName}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatPlayerCategory(row.birthDate)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {getPositionLabel(row.position)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {preview.invalid.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Filas omitidas
                  </p>
                  <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-amber-200 bg-amber-50 p-4">
                    {preview.invalid.slice(0, 12).map((row) => (
                      <li
                        key={row.rowNumber}
                        className="flex gap-2 text-sm text-amber-900"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          Fila {row.rowNumber} · {row.preview}: {row.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4F8C]" />
                <p>
                  Se importarán como fichas privadas. Después puedes filtrar por
                  generación, completar foto/video y activar consentimiento para
                  compartir con padres o visorías.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Cancelar
            </Dialog.Close>
            <button
              type="button"
              disabled={!preview || preview.valid.length === 0 || importing}
              onClick={handleConfirmImport}
              className={cn(
                "rounded-lg bg-[#1B4F8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#164278]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {importing
                ? "Importando..."
                : preview
                  ? `Importar ${preview.valid.length} jugador${preview.valid.length === 1 ? "" : "es"}`
                  : "Importar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
