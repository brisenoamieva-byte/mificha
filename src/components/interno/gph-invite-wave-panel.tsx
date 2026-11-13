"use client";

import { useMemo, useState } from "react";
import {
  GPH_INVITE_CSV_COLUMNS,
  GPH_INVITE_LANDING_PATH,
  GPH_INVITE_PLAYBOOK,
  gphInviteEmailBody,
  gphInviteEmailMailto,
  gphInviteEmailSubject,
  gphInviteTutorHref,
  gphInviteWhatsAppHref,
  gphInviteWhatsAppText,
} from "@/lib/gph-invite-wave";

export function GphInviteWavePanel() {
  const [tutorName, setTutorName] = useState("María");
  const [playerName, setPlayerName] = useState("Diego");
  const [phone, setPhone] = useState("524426121214");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const landing = useMemo(
    () => gphInviteTutorHref({ wave: 1, absolute: true, segment: "caliente" }),
    [],
  );
  const waText = useMemo(
    () => gphInviteWhatsAppText({ tutorName, playerName, wave: 1 }),
    [tutorName, playerName],
  );
  const emailBody = useMemo(
    () => gphInviteEmailBody({ tutorName, playerName, wave: 1 }),
    [tutorName, playerName],
  );

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Interno · GPH
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-mf-gph-ink">
          {GPH_INVITE_PLAYBOOK.title}
        </h1>
        <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
          Landing público:{" "}
          <a href={GPH_INVITE_LANDING_PATH} className="font-semibold text-mf-gph hover:underline">
            {GPH_INVITE_LANDING_PATH}
          </a>
          . No subas 3000 cuentas: invita por oleadas.
        </p>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <strong>Pausada.</strong> No operar la ola hasta que la plataforma esté al 100%.
          Esta pantalla es solo preparación interna.
        </p>
      </div>

      <section className="rounded-xl border border-mf-border bg-white p-5">
        <h2 className="text-sm font-semibold text-mf-gph-ink">Playbook</h2>
        <ol className="mt-3 space-y-1.5 text-sm leading-6 text-mf-text-secondary">
          {GPH_INVITE_PLAYBOOK.steps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm font-medium text-mf-gph-ink">
          Meta ola 1: {GPH_INVITE_PLAYBOOK.targetsWave1}
        </p>
        <p className="mt-2 text-xs text-mf-text-muted">
          Métricas: {GPH_INVITE_PLAYBOOK.metrics.join(" · ")}
        </p>
      </section>

      <section className="rounded-xl border border-mf-border bg-white p-5">
        <h2 className="text-sm font-semibold text-mf-gph-ink">CSV canónico</h2>
        <p className="mt-2 font-mono text-xs leading-6 text-mf-text-secondary">
          {GPH_INVITE_CSV_COLUMNS.join(",")}
        </p>
        <button
          type="button"
          className="mf-btn-gph-ghost mt-3"
          onClick={() => void copy("csv", GPH_INVITE_CSV_COLUMNS.join(","))}
        >
          {copied === "csv" ? "Copiado" : "Copiar encabezados"}
        </button>
      </section>

      <section className="rounded-xl border border-mf-border bg-white p-5">
        <h2 className="text-sm font-semibold text-mf-gph-ink">Personalizar plantilla</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-mf-text">
            Tutor
            <input
              className="mf-input mt-1"
              value={tutorName}
              onChange={(e) => setTutorName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Jugador
            <input
              className="mf-input mt-1"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Teléfono E.164 (WA)
            <input
              className="mf-input mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="52XXXXXXXXXX"
            />
          </label>
          <label className="block text-sm font-medium text-mf-text">
            Email (opcional)
            <input
              className="mf-input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tutor@correo.com"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-mf-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-mf-gph-ink">Link de campaña</h2>
          <button
            type="button"
            className="mf-btn-gph-ghost"
            onClick={() => void copy("link", landing)}
          >
            {copied === "link" ? "Copiado" : "Copiar link"}
          </button>
        </div>
        <p className="break-all font-mono text-xs text-mf-text-secondary">{landing}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-mf-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-mf-gph-ink">WhatsApp</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="mf-btn-gph-ghost"
              onClick={() => void copy("wa", waText)}
            >
              {copied === "wa" ? "Copiado" : "Copiar texto"}
            </button>
            <a
              href={gphInviteWhatsAppHref({
                tutorName,
                playerName,
                phoneE164: phone,
                wave: 1,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mf-btn-gph"
            >
              Abrir WA
            </a>
          </div>
        </div>
        <pre className="whitespace-pre-wrap rounded-lg bg-mf-canvas p-4 text-sm leading-6 text-mf-text-secondary">
          {waText}
        </pre>
      </section>

      <section className="space-y-3 rounded-xl border border-mf-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-mf-gph-ink">Email</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="mf-btn-gph-ghost"
              onClick={() => void copy("email", emailBody)}
            >
              {copied === "email" ? "Copiado" : "Copiar cuerpo"}
            </button>
            <a
              href={gphInviteEmailMailto({
                tutorName,
                playerName,
                email: email || undefined,
                wave: 1,
              })}
              className="mf-btn-gph"
            >
              Abrir mailto
            </a>
          </div>
        </div>
        <p className="text-xs font-semibold text-mf-text-muted">
          Asunto: {gphInviteEmailSubject()}
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-mf-canvas p-4 text-sm leading-6 text-mf-text-secondary">
          {emailBody}
        </pre>
      </section>
    </div>
  );
}
