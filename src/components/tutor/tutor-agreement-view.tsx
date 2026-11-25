"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GphAgreement } from "@/lib/gph-agreements";
import type { GphReglamentoSection } from "@/lib/gph-reglamento-content";
import {
  GPH_LEVELS,
  GPH_POSITIONS,
  GPH_SCHEDULES,
  GPH_SEDES,
} from "@/lib/gph-reglamento-content";
import { cn } from "@/lib/utils";

function labelOf<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string,
) {
  return list.find((row) => row.id === id)?.label ?? id;
}

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

export function TutorAgreementView({ agreementId }: { agreementId: string }) {
  const [agreement, setAgreement] = useState<GphAgreement | null>(null);
  const [sections, setSections] = useState<GphReglamentoSection[]>([]);
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readAck, setReadAck] = useState(false);
  const [consent, setConsent] = useState(false);
  const [acceptorName, setAcceptorName] = useState("");
  const [scrolledEnd, setScrolledEnd] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/fut/api/tutor/agreements?id=${encodeURIComponent(agreementId)}`,
        { headers: await sessionHeaders() },
      );
      const payload = (await response.json()) as {
        error?: string;
        agreement?: GphAgreement;
        sections?: GphReglamentoSection[];
        version?: string;
      };
      if (!response.ok) throw new Error(payload.error || "No se pudo cargar.");
      setAgreement(payload.agreement ?? null);
      setSections(payload.sections ?? []);
      setVersion(payload.version ?? "");
      if (payload.agreement?.fields.guardian_name) {
        setAcceptorName(payload.agreement.fields.guardian_name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar.");
      setAgreement(null);
    } finally {
      setLoading(false);
    }
  }, [agreementId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function accept() {
    if (!agreement) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/fut/api/tutor/agreements", {
        method: "POST",
        headers: await sessionHeaders(),
        body: JSON.stringify({
          action: "accept",
          agreement_id: agreement.id,
          acceptor_name: acceptorName,
          consent: true,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        agreement?: GphAgreement;
      };
      if (!response.ok) throw new Error(payload.error || "No se pudo firmar.");
      setAgreement(payload.agreement ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo firmar.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/fut/api/tutor/agreements?id=${encodeURIComponent(agreementId)}&pdf=1`,
        { headers: await sessionHeaders() },
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "No se pudo descargar.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `gph-carta-${agreementId.slice(0, 8)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo descargar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-mf-text-muted">Cargando carta…</p>;
  }

  if (!agreement) {
    const needsLogin =
      Boolean(error?.toLowerCase().includes("inicia sesión")) ||
      Boolean(error?.toLowerCase().includes("no autenticado"));
    const next = `/fut/tutor/acuerdo/${agreementId}`;
    return (
      <div className="space-y-3">
        <p className="text-sm text-mf-danger">{error || "Carta no encontrada."}</p>
        {needsLogin ? (
          <Link
            href={`/fut/entrar?next=${encodeURIComponent(next)}`}
            className="inline-flex text-sm font-semibold text-mf-gph"
          >
            Inicia sesión para firmar →
          </Link>
        ) : (
          <Link href="/fut/tutor" className="text-sm font-semibold text-mf-gph">
            ← Volver al tutor
          </Link>
        )}
      </div>
    );
  }

  const canSign = agreement.status === "sent";
  const signed =
    agreement.status === "signed_tutor" || agreement.status === "active";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/fut/tutor" className="text-sm font-semibold text-mf-gph hover:underline">
        ← Volver al tutor
      </Link>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
          GPH · Reglamento v{version || agreement.template_version}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-mf-gph-ink">
          {agreement.template_title}
        </h1>
        <p className="mt-1 text-sm text-mf-text-secondary">
          {agreement.fields.player_name} ·{" "}
          {agreement.status === "active"
            ? "Activa (firmada por ambas partes)"
            : agreement.status === "signed_tutor"
              ? "Firmada por ti · pendiente GPH"
              : "Pendiente de tu firma"}
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-mf-gph-ink">Resumen del paquete</p>
        <dl className="mt-3 grid gap-2 text-sm text-mf-text-secondary sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">Sede</dt>
            <dd className="font-medium text-mf-gph-ink">
              {labelOf(GPH_SEDES, agreement.fields.sede)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">Nivel</dt>
            <dd className="font-medium text-mf-gph-ink">
              {labelOf(GPH_LEVELS, agreement.fields.level_id)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">Días</dt>
            <dd className="font-medium text-mf-gph-ink">
              {labelOf(GPH_SCHEDULES, agreement.fields.schedule)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">Posición</dt>
            <dd className="font-medium text-mf-gph-ink">
              {labelOf(GPH_POSITIONS, agreement.fields.position)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">Periodo</dt>
            <dd className="font-medium text-mf-gph-ink">
              {agreement.fields.program_start} → {agreement.fields.program_end}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-mf-text-muted">
              Monto pactado
            </dt>
            <dd className="font-semibold text-mf-gph-ink">
              ${agreement.fields.amount_agreed_mxn.toLocaleString("es-MX")} MXN
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="max-h-[55vh] overflow-y-auto rounded-2xl border border-mf-border bg-white p-4 sm:p-5"
        onScroll={(event) => {
          const el = event.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
            setScrolledEnd(true);
            setReadAck(true);
          }
        }}
      >
        <p className="text-sm font-semibold text-mf-gph-ink">Texto del reglamento</p>
        <p className="mt-1 text-xs text-mf-text-muted">
          Desplázate hasta el final para habilitar la firma.
        </p>
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-sm font-semibold text-mf-gph-ink">{section.title}</h2>
              <ul className="mt-2 space-y-2">
                {section.paragraphs.map((paragraph) => (
                  <li
                    key={paragraph.slice(0, 40)}
                    className="text-sm leading-6 text-mf-text-secondary"
                  >
                    {paragraph}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {canSign ? (
        <section className="space-y-3 rounded-2xl border border-mf-border bg-white p-4 sm:p-5">
          <label className="flex items-start gap-2 text-sm text-mf-text-secondary">
            <input
              type="checkbox"
              className="mt-1"
              checked={readAck}
              onChange={(event) => setReadAck(event.target.checked)}
            />
            He leído el Reglamento y Carta Compromiso (versión{" "}
            {version || agreement.template_version}).
          </label>
          <label className="flex items-start gap-2 text-sm text-mf-text-secondary">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            Acepto en nombre del tutor/padre/madre y confirmo los datos del jugador.
          </label>
          <label className="block text-sm">
            <span className="font-medium text-mf-gph-ink">Nombre completo</span>
            <input
              type="text"
              value={acceptorName}
              onChange={(event) => setAcceptorName(event.target.value)}
              className="mf-input mt-1"
            />
          </label>
          <button
            type="button"
            disabled={
              busy || !readAck || !consent || !acceptorName.trim() || (!scrolledEnd && !readAck)
            }
            onClick={() => void accept()}
            className={cn(
              "mf-btn-gph w-full justify-center",
              (busy || !consent || !acceptorName.trim()) && "opacity-60",
            )}
          >
            {busy ? "Firmando…" : "Firmar y enviar"}
          </button>
          <p className="text-xs text-mf-text-muted">
            Se guardará tu usuario, fecha, hora e IP como evidencia de aceptación
            electrónica. GPH contrafirma después.
          </p>
        </section>
      ) : null}

      {signed ? (
        <section className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            {agreement.status === "active"
              ? "Carta activa"
              : "Ya firmaste · GPH completará la contrafirma"}
          </p>
          {agreement.tutor_evidence ? (
            <p className="text-xs text-emerald-900/80">
              Firmado por {agreement.tutor_evidence.acceptor_name} el{" "}
              {new Date(agreement.tutor_evidence.accepted_at).toLocaleString("es-MX")}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadPdf()}
            className="mf-btn-gph"
          >
            Descargar PDF
          </button>
        </section>
      ) : null}
    </div>
  );
}
