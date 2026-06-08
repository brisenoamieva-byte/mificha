"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { Skeleton } from "@/components/dashboard/skeletons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { toast } from "@/components/ui/toast";
import { getGuardianNotificationReadiness } from "@/lib/guardian-readiness";
import type { GuardianNotificationResult } from "@/lib/guardian-notifications";
import {
  buildPlayerShareUrl,
  buildPlayerWhatsAppShareUrl,
} from "@/lib/share-ficha";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";

export function PlantelGuardiansContent() {
  const { academy } = useDashboard();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastSummary, setLastSummary] = useState<{
    sent: number;
    failed: number;
    skipped: number;
  } | null>(null);

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

  const rows = useMemo(
    () =>
      players.map((player) => ({
        player,
        readiness: getGuardianNotificationReadiness(player),
      })),
    [players],
  );

  const readyCount = rows.filter((row) => row.readiness.ok).length;
  const pendingCount = rows.length - readyCount;

  async function sendWelcome(playerIds?: string[]) {
    if (!academy) return;

    setSending(true);
    setLastSummary(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Sesión expirada. Vuelve a iniciar sesión.");
        return;
      }

      const response = await fetch("/api/notifications/welcome-ficha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          academy_id: academy.id,
          player_ids: playerIds,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        summary?: { sent: number; failed: number; skipped: number };
        results?: GuardianNotificationResult[];
      };

      if (!response.ok) {
        toast.error(payload.error ?? "No se pudieron enviar los avisos.");
        return;
      }

      if (payload.summary) {
        setLastSummary(payload.summary);
        const { sent, failed, skipped } = payload.summary;
        if (sent > 0) {
          toast.success(
            `${sent} link${sent === 1 ? "" : "s"} enviado${sent === 1 ? "" : "s"} por email o WhatsApp.`,
          );
        } else if (failed > 0) {
          toast.error("Falló el envío. Revisa contacto del tutor o Resend/Twilio.");
        } else if (skipped > 0) {
          toast.error("Nadie listo para aviso automático. Completa consentimiento y contacto.");
        }
      }
    } catch {
      toast.error("Error de red al enviar avisos.");
    } finally {
      setSending(false);
    }
  }

  async function copyLink(slug: string) {
    const url = buildPlayerShareUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    } catch {
      toast.error("No se pudo copiar el link.");
    }
  }

  if (!academy) return <NoAcademyState />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/plantel"
            className="text-sm font-medium text-[#1B4F8C] hover:underline"
          >
            ← Volver al plantel
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Avisos a tutores
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Sin imprimir nada: MiFicha envía el link de la ficha por email o
            WhatsApp. Tras cada partido los tutores reciben la actualización
            automática si tienen contacto y consentimiento.
          </p>
        </div>

        <button
          type="button"
          disabled={sending || readyCount === 0}
          onClick={() => sendWelcome()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Enviando…" : `Enviar link a ${readyCount} listos`}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">{readyCount}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-800">
            Listos para aviso automático
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800">
            Faltan datos
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-2xl font-bold text-slate-900">{players.length}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Jugadores en plantel
          </p>
        </div>
      </div>

      {lastSummary ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">
          Último envío: {lastSummary.sent} enviados · {lastSummary.skipped}{" "}
          omitidos · {lastSummary.failed} fallidos
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            Requisitos por jugador
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Consentimiento + ficha pública + WhatsApp o email del tutor + avisos
            activados
          </p>
        </div>

        {loading ? (
          <div className="p-4">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : players.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            Carga jugadores en Plantel primero.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ player, readiness }) => (
              <li
                key={player.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PlayerAvatar
                    firstName={player.first_name}
                    lastName={player.last_name}
                    photoUrl={player.photo_url}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {player.guardian_name?.trim() || "Sin nombre de tutor"}
                      {player.guardian_phone?.trim()
                        ? ` · ${player.guardian_phone.trim()}`
                        : ""}
                      {player.guardian_email?.trim()
                        ? ` · ${player.guardian_email.trim()}`
                        : ""}
                    </p>
                    {!readiness.ok ? (
                      <p className="mt-1 text-xs text-amber-700">{readiness.reason}</p>
                    ) : (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Listo para avisos
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(player.slug)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar link
                  </button>
                  <a
                    href={buildPlayerWhatsAppShareUrl(
                      player.slug,
                      player.first_name,
                      player.last_name,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp manual
                  </a>
                  <button
                    type="button"
                    disabled={!readiness.ok || sending}
                    onClick={() => sendWelcome([player.id])}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4F8C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#164278] disabled:opacity-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Enviar automático
                  </button>
                  <Link
                    href="/dashboard/plantel"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    Editar en plantel
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
