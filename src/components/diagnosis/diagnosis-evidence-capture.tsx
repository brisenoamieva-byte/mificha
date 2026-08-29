"use client";

import { useRef, useState } from "react";
import { Camera, Film, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  DIAGNOSIS_EVIDENCE_MAX,
  testsForBattery,
  type GphEvidenceItem,
  type GphFieldSession,
} from "@/lib/gph-field-protocol";
import type { DiagnosisModule } from "@/lib/player-diagnosis";
import { uploadDiagnosisEvidence } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface DiagnosisEvidenceCaptureProps {
  academyId: string;
  module: DiagnosisModule;
  session: GphFieldSession;
  onChange: (session: GphFieldSession) => void;
}

export function DiagnosisEvidenceCapture({
  academyId,
  module,
  session,
  onChange,
}: DiagnosisEvidenceCaptureProps) {
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const stations = testsForBattery(module, session.protocolStage, session.sessionType);
  const remaining = DIAGNOSIS_EVIDENCE_MAX - session.evidence.length;

  function commit(evidence: GphEvidenceItem[]) {
    onChange({
      ...session,
      evidence,
      keyTestsVideo: evidence.some((item) => item.kind === "video") ? true : session.keyTestsVideo,
    });
  }

  async function addFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    if (!academyId) {
      toast.error("Selecciona la academia antes de subir evidencia.");
      return;
    }
    if (remaining <= 0) {
      toast.error(`Máximo ${DIAGNOSIS_EVIDENCE_MAX} archivos por evaluación.`);
      return;
    }

    const files = Array.from(list).slice(0, remaining);
    setBusy(true);
    const next = [...session.evidence];
    const nextPreviews = { ...previews };
    try {
      for (const file of files) {
        try {
          const uploaded = await uploadDiagnosisEvidence(academyId, file);
          const item: GphEvidenceItem = {
            id: crypto.randomUUID(),
            kind: uploaded.kind,
            url: uploaded.url,
            caption: "",
            stationId: "",
            createdAt: new Date().toISOString(),
          };
          next.push(item);
          nextPreviews[item.id] = uploaded.previewUrl;
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : `No se pudo subir ${file.name}.`,
          );
        }
      }
      setPreviews(nextPreviews);
      commit(next);
    } finally {
      setBusy(false);
    }
  }

  function patchItem(id: string, partial: Partial<GphEvidenceItem>) {
    commit(
      session.evidence.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    );
  }

  return (
    <div className="rounded-xl border border-mf-border-subtle bg-mf-canvas/60 p-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-mf-text">Evidencia de la sesión</h3>
          <p className="mt-0.5 text-xs text-mf-text-muted">
            Fotos y clips de las estaciones. Quedan en la ficha. {session.evidence.length}/
            {DIAGNOSIS_EVIDENCE_MAX}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={busy || remaining <= 0 || !academyId}
            onClick={() => cameraPhotoRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-mf-brand ring-1 ring-mf-border hover:bg-mf-brand-soft disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            Foto
          </button>
          <button
            type="button"
            disabled={busy || remaining <= 0 || !academyId}
            onClick={() => cameraVideoRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-mf-brand ring-1 ring-mf-border hover:bg-mf-brand-soft disabled:opacity-50"
          >
            <Film className="h-3.5 w-3.5" />
            Clip
          </button>
          <button
            type="button"
            disabled={busy || remaining <= 0 || !academyId}
            onClick={() => galleryRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-mf-text-secondary ring-1 ring-mf-border hover:bg-mf-brand-soft disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Galería
          </button>
        </div>
      </div>

      <input
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {busy ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-mf-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Subiendo evidencia…
        </p>
      ) : null}

      {session.evidence.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {session.evidence.map((item) => {
            const src = previews[item.id] || item.url;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-xl border border-mf-border bg-white"
              >
                {item.kind === "video" ? (
                  <video
                    src={src}
                    controls
                    playsInline
                    className="h-40 w-full bg-black object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-40 w-full object-cover" />
                )}
                <div className="space-y-2 p-2.5">
                  <select
                    value={item.stationId}
                    onChange={(event) => patchItem(item.id, { stationId: event.target.value })}
                    className="mf-input text-xs"
                  >
                    <option value="">Proceso general</option>
                    {stations.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.number}. {test.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={item.caption}
                    onChange={(event) => patchItem(item.id, { caption: event.target.value })}
                    className="mf-input text-xs"
                    placeholder="Nota corta (opcional)"
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={() => commit(session.evidence.filter((row) => row.id !== item.id))}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-medium text-mf-text-muted hover:text-mf-danger",
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-mf-text-muted">
          En cancha: toma la foto o el clip al terminar la estación. No hace falta un editor.
        </p>
      )}
    </div>
  );
}
