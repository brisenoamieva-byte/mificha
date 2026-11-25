"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  GPH_POSITIONS,
  GPH_REGLAMENTO_SECTIONS,
  GPH_REGLAMENTO_VERSION,
  GPH_SCHEDULES,
  GPH_SEDES,
  computeGphPackage,
} from "@/lib/gph-reglamento-content";
import { LEGAL_ROUTES } from "@/lib/legal";
import { GPH_WHATSAPP_DISPLAY, GPH_WHATSAPP_E164 } from "@/lib/gph-alliance";

function gphWaHref(text: string) {
  return `https://wa.me/${GPH_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

const inputClass = "mf-input mt-1 w-full";
const checkClass = "mt-1 size-4 shrink-0 accent-[#f54200]";
const labelClass = "block text-sm font-medium text-mf-gph-ink";

async function sessionHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Inicia sesión.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

export function GphEnrollmentForm({
  defaultEmail,
  defaultName,
}: {
  defaultEmail?: string | null;
  defaultName?: string | null;
}) {
  const [guardianName, setGuardianName] = useState(defaultName ?? "");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sede, setSede] = useState<(typeof GPH_SEDES)[number]["id"]>("casa_juventud");
  const [schedule, setSchedule] =
    useState<(typeof GPH_SCHEDULES)[number]["id"]>("lun_mie");
  const [position, setPosition] =
    useState<(typeof GPH_POSITIONS)[number]["id"]>("campo");
  const [foot, setFoot] = useState<"right" | "left" | "both">("right");
  const [publicCode, setPublicCode] = useState("");
  const [reglamento, setReglamento] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [acceptorName, setAcceptorName] = useState(defaultName ?? "");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    agreementId: string;
    playerName: string;
    publicCode: string | null;
    amount: number;
    reused: boolean;
  } | null>(null);

  const estimate = useMemo(
    () =>
      computeGphPackage({
        levelId: "desarrollo",
        paymentMode: "monthly",
        months: 1,
        inscriptionExempt: false,
      }),
    [],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/fut/api/gph/enroll", {
        method: "POST",
        headers: await sessionHeaders(),
        body: JSON.stringify({
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          player_name: playerName,
          birth_date: birthDate,
          sede,
          schedule,
          position,
          dominant_foot: foot,
          acceptor_name: acceptorName || guardianName,
          privacy_accepted: privacy,
          reglamento_accepted: reglamento,
          public_code: publicCode.trim() || null,
          honeypot,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        agreement_id?: string;
        public_code?: string | null;
        amount_mxn?: number;
        player_name?: string;
        reused?: boolean;
      };
      if (!response.ok || !payload.agreement_id) {
        throw new Error(payload.error || "No se pudo completar la inscripción.");
      }
      setDone({
        agreementId: payload.agreement_id,
        playerName: payload.player_name || playerName,
        publicCode: payload.public_code ?? null,
        amount: payload.amount_mxn ?? estimate.totalMxn,
        reused: Boolean(payload.reused),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al inscribir.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const amountLabel = done.amount.toLocaleString("es-MX");
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {done.reused ? "Ya registrada" : "Inscripción lista"}
        </p>
        <h2 className="text-xl font-semibold text-mf-gph-ink">{done.playerName}</h2>
        <p className="text-sm leading-6 text-mf-text-secondary">
          Reglamento firmado. GPH confirma nivel y monto. Referencia provisional: $
          {amountLabel} (1er mes Desarrollo + inscripción).
        </p>
        {done.publicCode ? (
          <p className="rounded-xl bg-mf-canvas px-3 py-2 text-sm font-semibold text-mf-gph-ink">
            Código MiFicha: {done.publicCode}
          </p>
        ) : null}
        <ol className="list-decimal space-y-1 pl-5 text-sm text-mf-text-secondary">
          <li>Revisa tu ficha en MiFicha.</li>
          <li>Espera confirmación de GPH (nivel / horario).</li>
          <li>Si tienes duda, escribe por WhatsApp.</li>
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/fut/tutor" className="mf-btn-gph justify-center">
            Ir a mis fichas
          </Link>
          <Link
            href={`/fut/tutor/acuerdo/${done.agreementId}`}
            className="mf-btn-gph-ghost justify-center"
          >
            Ver acuerdo firmado
          </Link>
          <a
            href={gphWaHref(
              `Hola GPH, ya inscribí a ${done.playerName} por la liga de MiFicha${
                done.publicCode ? ` (${done.publicCode})` : ""
              }.`,
            )}
            className="mf-btn-gph-ghost justify-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp GPH · {GPH_WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <section className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-mf-gph-ink">1. Tutor</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Nombre del tutor
            <input
              className={inputClass}
              value={guardianName}
              onChange={(e) => {
                setGuardianName(e.target.value);
                if (!acceptorName || acceptorName === guardianName) {
                  setAcceptorName(e.target.value);
                }
              }}
              required
              autoComplete="name"
            />
          </label>
          <label className={labelClass}>
            WhatsApp (10 dígitos)
            <input
              className={inputClass}
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              required
              inputMode="tel"
              placeholder="4421234567"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-mf-text-muted">
          Sesión: {defaultEmail || "cuenta activa"}
        </p>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-mf-gph-ink">2. Jugador</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nombre completo
            <input
              className={inputClass}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Fecha de nacimiento
            <input
              type="date"
              className={inputClass}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            Posición
            <select
              className={inputClass}
              value={position}
              onChange={(e) =>
                setPosition(e.target.value as (typeof GPH_POSITIONS)[number]["id"])
              }
            >
              {GPH_POSITIONS.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Pie dominante
            <select
              className={inputClass}
              value={foot}
              onChange={(e) => setFoot(e.target.value as typeof foot)}
            >
              <option value="right">Derecho</option>
              <option value="left">Izquierdo</option>
              <option value="both">Ambos</option>
            </select>
          </label>
          <label className={labelClass}>
            Código MF- (opcional)
            <input
              className={inputClass}
              value={publicCode}
              onChange={(e) => setPublicCode(e.target.value.toUpperCase())}
              placeholder="Si ya tiene ficha / visoría"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-mf-gph-ink">3. Entrenamiento</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Sede preferida
            <select
              className={inputClass}
              value={sede}
              onChange={(e) =>
                setSede(e.target.value as (typeof GPH_SEDES)[number]["id"])
              }
            >
              {GPH_SEDES.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Horario preferido
            <select
              className={inputClass}
              value={schedule}
              onChange={(e) =>
                setSchedule(e.target.value as (typeof GPH_SCHEDULES)[number]["id"])
              }
            >
              {GPH_SCHEDULES.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 rounded-xl bg-mf-canvas px-3 py-2 text-xs leading-5 text-mf-text-secondary">
          Nivel provisional: Desarrollo · estimado $
          {estimate.totalMxn.toLocaleString("es-MX")} (mensualidad + inscripción). GPH lo
          confirma tras el diagnóstico.
        </p>
      </section>

      <section className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold text-mf-gph-ink">
          4. Firma · Reglamento {GPH_REGLAMENTO_VERSION}
        </h2>
        <p className="mt-1 text-xs text-mf-text-muted">Desliza para leer completo</p>
        <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-mf-border bg-mf-canvas/70 p-3 text-xs leading-5 text-mf-text-secondary">
          {GPH_REGLAMENTO_SECTIONS.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              <p className="font-semibold text-mf-gph-ink">{section.title}</p>
              {section.paragraphs.map((p, index) => (
                <p key={`${section.id}-${index}`} className="mt-1">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-2 text-sm text-mf-text">
          <input
            type="checkbox"
            className={checkClass}
            checked={reglamento}
            onChange={(e) => setReglamento(e.target.checked)}
          />
          <span>Leí y acepto el Reglamento y Carta Compromiso GPH.</span>
        </label>
        <label className="mt-3 flex items-start gap-2 text-sm text-mf-text">
          <input
            type="checkbox"
            className={checkClass}
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
          />
          <span>
            Acepto el{" "}
            <Link href={LEGAL_ROUTES.privacy} className="font-semibold text-mf-brand underline">
              aviso de privacidad
            </Link>{" "}
            de MiFicha.
          </span>
        </label>
        <label className={`${labelClass} mt-3`}>
          Nombre de quien firma
          <input
            className={inputClass}
            value={acceptorName}
            onChange={(e) => setAcceptorName(e.target.value)}
            required
          />
        </label>
      </section>

      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || !reglamento || !privacy}
        className="mf-btn-gph h-12 w-full justify-center disabled:opacity-60"
      >
        {loading ? "Inscribiendo…" : "Inscribir y firmar"}
      </button>
    </form>
  );
}
