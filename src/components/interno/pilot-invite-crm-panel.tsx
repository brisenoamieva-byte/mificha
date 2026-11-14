"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PILOT_INVITE_STATUSES,
  PILOT_INVITE_STATUS_LABEL,
  pilotInviteEmailHref,
  pilotInviteWhatsAppHref,
  type PilotInviteLead,
  type PilotInviteStatus,
} from "@/lib/pilot-invite-crm";
import type { GphInviteSegment } from "@/lib/gph-invite-wave";

type Summary = {
  total: number;
  invited: number;
  activated: number;
  fichas: number;
  counts: Record<PilotInviteStatus, number>;
};

const emptyForm = {
  tutor_name: "",
  player_name: "",
  phone: "",
  email: "",
  segment: "caliente" as GphInviteSegment,
  notes: "",
};

async function authed(path: string, init?: RequestInit) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Inicia sesión.");
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    leads?: PilotInviteLead[];
    summary?: Summary;
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo completar.");
  return payload;
}

export function PilotInviteCrmPanel() {
  const [leads, setLeads] = useState<PilotInviteLead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const payload = await authed("/fut/api/interno/pilot-invites");
    setLeads(payload.leads ?? []);
    setSummary(payload.summary ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se cargó la ola.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await authed("/fut/api/interno/pilot-invites", {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          ...form,
          player_name: form.player_name || null,
          phone: form.phone || null,
          email: form.email || null,
          notes: form.notes || null,
          wave: 1,
        }),
      });
      setLeads(payload.leads ?? []);
      setSummary(payload.summary ?? null);
      setForm(emptyForm);
      setNotice("Contacto agregado a la ola piloto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se guardó.");
    } finally {
      setBusy(false);
    }
  }

  async function patchLead(
    id: string,
    body: Record<string, unknown>,
    okMessage?: string,
  ) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const payload = await authed("/fut/api/interno/pilot-invites", {
        method: "POST",
        body: JSON.stringify({ action: "update", id, ...body }),
      });
      setLeads(payload.leads ?? []);
      setSummary(payload.summary ?? null);
      if (okMessage) setNotice(okMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se actualizó.");
    } finally {
      setBusy(false);
    }
  }

  async function removeLead(id: string) {
    if (!window.confirm("¿Quitar este contacto de la ola?")) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await authed("/fut/api/interno/pilot-invites", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
      setLeads(payload.leads ?? []);
      setSummary(payload.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se eliminó.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Ola piloto · en plataforma
        </p>
        <h2 className="mt-1 text-xl font-semibold text-mf-gph-ink">
          Seguimiento de invitados
        </h2>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
          Sin Google Sheet: alta, estado y WhatsApp/email quedan guardados en MiFicha.
          Meta sugerida: ~20 contactos calientes.
        </p>
      </div>

      {summary ? (
        <div className="grid gap-2 sm:grid-cols-4">
          {[
            ["Total", summary.total],
            ["Invitados", summary.invited],
            ["Entraron", summary.activated],
            ["Con ficha", summary.fichas],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-mf-border bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                {label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-mf-gph-ink">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-mf-danger/30 bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}
        </p>
      ) : null}

      <form
        onSubmit={(event) => void onCreate(event)}
        className="space-y-3 rounded-xl border border-mf-border bg-white p-4 sm:p-5"
      >
        <p className="text-sm font-semibold text-mf-gph-ink">Agregar a la ola</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-mf-text">
            Tutor *
            <input
              required
              className="mf-input mt-1"
              value={form.tutor_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, tutor_name: event.target.value }))
              }
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Jugador
            <input
              className="mf-input mt-1"
              value={form.player_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, player_name: event.target.value }))
              }
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            WhatsApp
            <input
              className="mf-input mt-1"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="4421234567"
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Email
            <input
              type="email"
              className="mf-input mt-1"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Segmento
            <select
              className="mf-input mt-1"
              value={form.segment}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  segment: event.target.value as GphInviteSegment,
                }))
              }
            >
              <option value="caliente">Caliente</option>
              <option value="tibio">Tibio</option>
              <option value="frio">Frío</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Nota
            <input
              className="mf-input mt-1"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Conoce a GPH / visoría…"
            />
          </label>
        </div>
        <button type="submit" disabled={busy} className="mf-btn-gph">
          Guardar contacto
        </button>
      </form>

      <section className="rounded-xl border border-mf-border bg-white">
        <div className="border-b border-mf-border px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-mf-gph-ink">
            Lista · {leads.length}
            {summary && summary.total >= 20 ? " · meta 20 alcanzada" : ""}
          </p>
        </div>
        {loading ? (
          <p className="px-4 py-8 text-sm text-mf-text-muted">Cargando…</p>
        ) : leads.length === 0 ? (
          <p className="px-4 py-8 text-sm text-mf-text-muted">
            Aún no hay contactos. Agrega los primeros 20 aquí.
          </p>
        ) : (
          <ul className="divide-y divide-mf-border-subtle">
            {leads.map((lead) => {
              const wa = pilotInviteWhatsAppHref(lead);
              const mail = pilotInviteEmailHref(lead);
              return (
                <li key={lead.id} className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-mf-gph-ink">{lead.tutor_name}</p>
                      <p className="mt-0.5 text-sm text-mf-text-secondary">
                        {[lead.player_name, lead.segment, lead.phone, lead.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {lead.notes ? (
                        <p className="mt-1 text-xs text-mf-text-muted">{lead.notes}</p>
                      ) : null}
                    </div>
                    <label className="block text-xs font-medium text-mf-text-secondary">
                      Estado
                      <select
                        className="mf-input mt-1 min-w-[10rem] text-sm"
                        disabled={busy}
                        value={lead.status}
                        onChange={(event) =>
                          void patchLead(lead.id, {
                            status: event.target.value,
                          })
                        }
                      >
                        {PILOT_INVITE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {PILOT_INVITE_STATUS_LABEL[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mf-btn-gph"
                        onClick={() =>
                          void patchLead(
                            lead.id,
                            { mark_invited: true, channel: "whatsapp" },
                            "Marcado como invitado (WhatsApp).",
                          )
                        }
                      >
                        Abrir WA + marcar
                      </a>
                    ) : null}
                    {mail ? (
                      <a
                        href={mail}
                        className="mf-btn-gph-ghost"
                        onClick={() =>
                          void patchLead(
                            lead.id,
                            {
                              mark_invited: true,
                              channel: lead.channel === "whatsapp" ? "ambos" : "email",
                            },
                            "Marcado como invitado (email).",
                          )
                        }
                      >
                        Email + marcar
                      </a>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy}
                      className="mf-btn-gph-ghost"
                      onClick={() =>
                        void patchLead(lead.id, { mark_reminded: true }, "Recordatorio anotado.")
                      }
                    >
                      Recordatorio
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-lg border border-mf-border px-3 py-2 text-xs font-semibold text-mf-danger hover:bg-mf-danger-soft"
                      onClick={() => void removeLead(lead.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
