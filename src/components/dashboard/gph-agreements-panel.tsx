"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSignature, Plus, Send } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { NoAcademyState } from "@/components/dashboard/no-academy-state";
import { toast } from "@/components/ui/toast";
import { diagnosisAuthedFetch } from "@/lib/player-diagnosis-client";
import type { GphAgreement } from "@/lib/gph-agreements";
import {
  GPH_LEVELS,
  GPH_POSITIONS,
  GPH_REGLAMENTO_VERSION,
  GPH_SCHEDULES,
  GPH_SEDES,
  computeGphPackage,
  type GphLevelId,
  type GphPaymentMode,
} from "@/lib/gph-reglamento-content";
import { cn } from "@/lib/utils";

type PlayerOption = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
};

type LinkOption = {
  player_id: string;
  tutor_child_id: string;
  player_name: string;
  guardian_email: string;
};

const emptyFields = {
  player_name: "",
  birth_date: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",
  sede: "casa_juventud" as const,
  group_level: "",
  schedule: "lun_mie" as const,
  position: "campo" as const,
  level_id: "desarrollo" as GphLevelId,
  payment_mode: "monthly" as GphPaymentMode,
  months: 6,
  inscription_exempt: false,
  inscription_exempt_reason: "",
  amount_agreed_mxn: 0,
  program_start: "",
  program_end: "",
  payment_note: "",
};

function statusLabel(status: GphAgreement["status"]) {
  if (status === "draft") return "Borrador";
  if (status === "sent") return "Enviada al tutor";
  if (status === "signed_tutor") return "Firmada · falta GPH";
  if (status === "active") return "Activa";
  return "Cancelada";
}

function statusClass(status: GphAgreement["status"]) {
  if (status === "active") return "bg-emerald-50 text-emerald-800";
  if (status === "signed_tutor") return "bg-amber-50 text-amber-900";
  if (status === "sent") return "bg-sky-50 text-sky-900";
  if (status === "cancelled") return "bg-slate-100 text-slate-500";
  return "bg-slate-50 text-slate-700";
}

export function GphAgreementsPanel() {
  const { academy } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreements, setAgreements] = useState<GphAgreement[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [links, setLinks] = useState<LinkOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [fields, setFields] = useState(emptyFields);

  const pkg = useMemo(() => {
    try {
      return computeGphPackage({
        levelId: fields.level_id,
        paymentMode: fields.payment_mode,
        months: Number(fields.months) || 1,
        inscriptionExempt: fields.inscription_exempt,
      });
    } catch {
      return null;
    }
  }, [fields.inscription_exempt, fields.level_id, fields.months, fields.payment_mode]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await diagnosisAuthedFetch("/fut/api/academy/agreements");
      setAgreements((payload.agreements as GphAgreement[]) ?? []);
      setPlayers((payload.players as PlayerOption[]) ?? []);
      setLinks((payload.links as LinkOption[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar.");
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pkg) return;
    setFields((current) =>
      current.amount_agreed_mxn > 0 && current.amount_agreed_mxn !== pkg.totalMxn
        ? current
        : { ...current, amount_agreed_mxn: pkg.totalMxn },
    );
  }, [pkg]);

  function onPickPlayer(id: string) {
    setPlayerId(id);
    const player = players.find((row) => row.id === id);
    if (!player) return;
    const link = links.find((row) => row.player_id === id);
    setFields((current) => ({
      ...current,
      player_name: `${player.first_name} ${player.last_name}`.trim(),
      birth_date: player.birth_date?.slice(0, 10) || current.birth_date,
      guardian_name: player.guardian_name || current.guardian_name,
      guardian_phone: player.guardian_phone || current.guardian_phone,
      guardian_email:
        player.guardian_email || link?.guardian_email || current.guardian_email,
    }));
  }

  async function createAndSend() {
    setBusy(true);
    setError(null);
    try {
      const link = links.find((row) => row.player_id === playerId);
      const created = await diagnosisAuthedFetch("/fut/api/academy/agreements", {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          player_id: playerId || undefined,
          tutor_child_id: link?.tutor_child_id,
          fields: {
            ...fields,
            amount_agreed_mxn: Number(fields.amount_agreed_mxn) || pkg?.totalMxn || 0,
            months: Number(fields.months) || 1,
          },
        }),
      });
      const agreement = created.agreement as GphAgreement;
      await diagnosisAuthedFetch("/fut/api/academy/agreements", {
        method: "POST",
        body: JSON.stringify({ action: "send", agreement_id: agreement.id }),
      });
      toast.success("Carta enviada al tutor.");
      setShowForm(false);
      setFields(emptyFields);
      setPlayerId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf(id: string, playerName: string) {
    setBusy(true);
    try {
      const {
        data: { session },
      } = await (await import("@/lib/supabase")).supabase.auth.getSession();
      if (!session) throw new Error("Inicia sesión.");
      const response = await fetch(
        `/fut/api/academy/agreements/pdf?id=${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "No se pudo descargar.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `gph-carta-${playerName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo descargar.");
    } finally {
      setBusy(false);
    }
  }

  async function act(action: "countersign" | "cancel" | "send", id: string) {
    setBusy(true);
    setError(null);
    try {
      await diagnosisAuthedFetch("/fut/api/academy/agreements", {
        method: "POST",
        body: JSON.stringify({ action, agreement_id: id }),
      });
      toast.success(
        action === "countersign"
          ? "Carta activa y PDF sellado."
          : action === "send"
            ? "Reenviada al tutor."
            : "Carta cancelada.",
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar.");
    } finally {
      setBusy(false);
    }
  }

  if (!academy) return <NoAcademyState />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            GPH · v{GPH_REGLAMENTO_VERSION}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Cartas compromiso
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Envía el Reglamento 2027 al tutor para firma electrónica. Tú contrafirmas
            y queda el PDF sellado. Sin cobro de mensualidades en MiFicha.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B4F8C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#164278]"
        >
          <Plus className="h-4 w-4" />
          Nueva carta
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {showForm ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Datos del acuerdo</p>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Jugador del plantel</span>
            <select
              value={playerId}
              onChange={(event) => onPickPlayer(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <option value="">— Elegir —</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.first_name} {player.last_name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["player_name", "Nombre del jugador"],
                ["birth_date", "Fecha de nacimiento"],
                ["guardian_name", "Tutor"],
                ["guardian_phone", "Teléfono tutor"],
                ["guardian_email", "Email tutor"],
                ["group_level", "Grupo / nivel interno"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <input
                  type={key === "birth_date" ? "date" : key.includes("email") ? "email" : "text"}
                  value={fields[key]}
                  onChange={(event) =>
                    setFields((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              </label>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Sede</span>
              <select
                value={fields.sede}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    sede: event.target.value as typeof current.sede,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                {GPH_SEDES.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Días</span>
              <select
                value={fields.schedule}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    schedule: event.target.value as typeof current.schedule,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                {GPH_SCHEDULES.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Posición</span>
              <select
                value={fields.position}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    position: event.target.value as typeof current.position,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                {GPH_POSITIONS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Nivel programa</span>
              <select
                value={fields.level_id}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    level_id: event.target.value as GphLevelId,
                    amount_agreed_mxn: 0,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                {GPH_LEVELS.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label} · ${row.monthlyMxn}/mes
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Modalidad de pago</span>
              <select
                value={fields.payment_mode}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    payment_mode: event.target.value as GphPaymentMode,
                    amount_agreed_mxn: 0,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                <option value="monthly">Pago mensual</option>
                <option value="prepaid">Pago anticipado (−10%)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Mensualidades</span>
              <input
                type="number"
                min={1}
                max={24}
                value={fields.months}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    months: Number(event.target.value) || 1,
                    amount_agreed_mxn: 0,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Inicio</span>
              <input
                type="date"
                value={fields.program_start}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    program_start: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Fin</span>
              <input
                type="date"
                value={fields.program_end}
                onChange={(event) =>
                  setFields((current) => ({
                    ...current,
                    program_end: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={fields.inscription_exempt}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  inscription_exempt: event.target.checked,
                  amount_agreed_mxn: 0,
                }))
              }
            />
            Inscripción exenta (alumno activo u otro motivo)
          </label>
          {fields.inscription_exempt ? (
            <input
              type="text"
              placeholder="Motivo de exención"
              value={fields.inscription_exempt_reason}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  inscription_exempt_reason: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          ) : null}

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {pkg ? (
              <>
                Referencia: {pkg.months} × ${pkg.monthlyMxn}
                {pkg.inscriptionMxn > 0 ? ` + inscripción $${pkg.inscriptionMxn}` : ""} = $
                {pkg.totalMxn}
              </>
            ) : null}
          </div>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Monto pactado (MXN)</span>
            <input
              type="number"
              min={0}
              value={fields.amount_agreed_mxn}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  amount_agreed_mxn: Number(event.target.value) || 0,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Nota de pago (opcional)</span>
            <input
              type="text"
              value={fields.payment_note}
              onChange={(event) =>
                setFields((current) => ({
                  ...current,
                  payment_note: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => void createAndSend()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4F8C] px-4 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {busy ? "Enviando…" : "Crear y enviar al tutor"}
          </button>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Cargando…</p>
        ) : agreements.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            Aún no hay cartas. Crea la primera para un jugador del plantel.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {agreements.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="font-semibold text-slate-900">{row.fields.player_name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {row.fields.guardian_name} · {row.fields.guardian_email || "sin email"} · $
                    {row.fields.amount_agreed_mxn}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      statusClass(row.status),
                    )}
                  >
                    {statusLabel(row.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.status === "signed_tutor" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act("countersign", row.id)}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Contrafirmar GPH
                    </button>
                  ) : null}
                  {row.status === "draft" || row.status === "sent" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act("send", row.id)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {row.status === "sent" ? "Reenviar" : "Enviar"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void downloadPdf(row.id, row.fields.player_name)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <FileSignature className="h-3.5 w-3.5" />
                    PDF
                  </button>
                  {row.status === "draft" || row.status === "sent" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act("cancel", row.id)}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-600"
                    >
                      Cancelar
                    </button>
                  ) : null}
                  {row.guardian_user_id ? (
                    <Link
                      href={`/fut/tutor/acuerdo/${row.id}`}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1B4F8C]"
                    >
                      Vista tutor
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
