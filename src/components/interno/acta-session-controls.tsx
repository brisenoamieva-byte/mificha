"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardPen, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ACTA_STATUS_LABELS, type ActaSessionStatus } from "@/lib/match-acta";
import type { Match } from "@/types/database";

interface ActaSessionControlsProps {
  fixture: Match;
  authedFetch: (input: string, init?: RequestInit) => Promise<Record<string, unknown>>;
}

interface SessionSummary {
  id: string;
  status: ActaSessionStatus;
  dispute_note?: string | null;
}

export function ActaSessionControls({
  fixture,
  authedFetch,
}: ActaSessionControlsProps) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [refereeUrl, setRefereeUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = (await authedFetch(
        `/fut/api/interno/acta-sessions?home_match_id=${encodeURIComponent(fixture.id)}`,
      )) as { session?: SessionSummary | null };
      setSession(payload.session ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cargó la sesión.");
    } finally {
      setLoading(false);
    }
  }, [authedFetch, fixture.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createSession() {
    setBusy(true);
    try {
      const payload = (await authedFetch("/fut/api/interno/acta-sessions", {
        method: "POST",
        body: JSON.stringify({ home_match_id: fixture.id }),
      })) as {
        session?: SessionSummary;
        referee_url?: string;
      };
      setSession(payload.session ?? null);
      setRefereeUrl(payload.referee_url ?? null);
      toast.success("Sesión de acta creada. Copia el link del árbitro.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se creó la sesión.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Link copiado");
  }

  async function resolve(action: "publish" | "cancel") {
    if (!session) return;
    setBusy(true);
    try {
      const payload = (await authedFetch(
        `/fut/api/interno/acta-sessions/${session.id}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({ action }),
        },
      )) as { session?: SessionSummary };
      setSession(payload.session ?? null);
      toast.success(action === "publish" ? "Acta publicada." : "Sesión cancelada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo resolver.");
    } finally {
      setBusy(false);
    }
  }

  if (fixture.acta_published_at) {
    return (
      <p className="rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold text-emerald-200">
        Acta publicada
      </p>
    );
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-white/50">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Acta…
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {session ? (
        <>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80">
            Acta: {ACTA_STATUS_LABELS[session.status]}
          </span>
          {session.status === "disputed" ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void resolve("publish")}
                className="rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/10"
              >
                Forzar publicar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void resolve("cancel")}
                className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10"
              >
                Cancelar sesión
              </button>
            </div>
          ) : null}
          {refereeUrl ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => void copy(refereeUrl)}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar link árbitro
              </button>
              <a
                href={refereeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir
              </a>
            </div>
          ) : (
            <p className="max-w-[220px] text-right text-[11px] text-white/45">
              El link del árbitro solo se muestra al crear la sesión. Crea una nueva si lo
              perdiste (cancela antes si aplica).
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          disabled={busy || !fixture.is_official}
          onClick={() => void createSession()}
          className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-500/20 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ClipboardPen className="h-3.5 w-3.5" />
          )}
          Acta en cancha
        </button>
      )}
    </div>
  );
}
