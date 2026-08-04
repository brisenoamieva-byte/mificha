"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import type { ActaSide } from "@/lib/match-acta";

interface SummaryItem {
  minute: number;
  stoppage: number;
  side: ActaSide;
  type: string;
  label: string;
  player: string;
  jersey: number | null;
}

export function DelegateSignApp({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<ActaSide | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [published, setPublished] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [opponent, setOpponent] = useState("");
  const [refereeName, setRefereeName] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [objectionNote, setObjectionNote] = useState("");
  const [mode, setMode] = useState<"form" | "object">("form");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/firmar/${encodeURIComponent(token)}`);
      const payload = (await response.json()) as {
        error?: string;
        side?: ActaSide;
        already_signed?: boolean;
        score?: { home: number; away: number };
        summary?: SummaryItem[];
        referee_name?: string | null;
        session?: { opponent_name?: string; status?: string };
      };
      if (!response.ok) throw new Error(payload.error ?? "Link inválido.");
      setSide(payload.side ?? null);
      setAlreadySigned(Boolean(payload.already_signed));
      setScore(payload.score ?? { home: 0, away: 0 });
      setSummary(payload.summary ?? []);
      setRefereeName(payload.referee_name ?? null);
      setOpponent(payload.session?.opponent_name ?? "");
      if (payload.session?.status === "published") setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(decision: "accept" | "object") {
    if (!signerName.trim()) {
      setError("Escribe tu nombre.");
      return;
    }
    if (decision === "object" && !objectionNote.trim()) {
      setError("La objeción requiere un motivo.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/fut/api/firmar/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          signer_name: signerName.trim(),
          signer_title: signerTitle.trim() || null,
          objection_note: decision === "object" ? objectionNote.trim() : null,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        published?: boolean;
      };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo firmar.");
      setPublished(Boolean(payload.published));
      setDone(true);
      setAlreadySigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mf-canvas">
        <Loader2 className="h-8 w-8 animate-spin text-mf-brand" />
      </div>
    );
  }

  if (error && !side) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mf-canvas px-4">
        <div className="max-w-md rounded-2xl border border-mf-border bg-white p-6 text-center">
          <p className="text-lg font-semibold text-mf-text">Firma no disponible</p>
          <p className="mt-2 text-sm text-mf-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-mf-canvas px-4 py-6 mf-page-bottom">
      <div className="mx-auto w-full max-w-md">
        <BrandLogoLink size="sm" className="mb-5 justify-center" />

        <div className="rounded-2xl border border-mf-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
            Confirmación de acta · {side === "home" ? "Local" : "Visitante"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-mf-text">
            Local {score.home} — {score.away} {opponent}
          </h1>
          {refereeName ? (
            <p className="mt-1 text-sm text-mf-text-secondary">Árbitro: {refereeName}</p>
          ) : null}

          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto rounded-xl bg-mf-canvas p-3 text-sm">
            {summary.length === 0 ? (
              <li className="text-mf-text-muted">Sin eventos registrados.</li>
            ) : (
              summary.map((item, index) => (
                <li key={`${item.minute}-${item.type}-${index}`}>
                  <strong>{item.minute}&apos;</strong> {item.label} ·{" "}
                  {item.jersey != null ? `#${item.jersey} ` : ""}
                  {item.player} ({item.side === "home" ? "L" : "V"})
                </li>
              ))
            )}
          </ul>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {alreadySigned || done ? (
            <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {published
                ? "Acta firmada y publicada. Gracias."
                : done
                  ? "Tu respuesta quedó registrada."
                  : "Este lado ya firmó el acta."}
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-mf-text-muted">
                Nombre del representante
                <input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mf-input mt-1"
                  placeholder="Nombre completo"
                />
              </label>
              <label className="block text-xs font-medium text-mf-text-muted">
                Cargo (opcional)
                <input
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="mf-input mt-1"
                  placeholder="Director / Delegado"
                />
              </label>

              {mode === "object" ? (
                <label className="block text-xs font-medium text-mf-text-muted">
                  Motivo de objeción
                  <textarea
                    value={objectionNote}
                    onChange={(e) => setObjectionNote(e.target.value)}
                    className="mf-input mt-1 min-h-[88px]"
                    placeholder="Describe la discrepancia"
                  />
                </label>
              ) : null}

              <button
                type="button"
                disabled={saving}
                onClick={() => void submit("accept")}
                className="mf-btn-primary w-full justify-center"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmo el acta
              </button>

              {mode === "form" ? (
                <button
                  type="button"
                  onClick={() => setMode("object")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  <X className="h-4 w-4" />
                  Objetar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void submit("object")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Enviar objeción
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
