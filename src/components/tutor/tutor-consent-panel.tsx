"use client";

import { useState } from "react";
import Link from "next/link";
import { FounderBadge } from "@/components/tutor/founder-badge";
import { LEGAL_ROUTES } from "@/lib/legal";
import { PRIVACY_COPY, type TutorExploreConsentEvidence } from "@/lib/privacy";
import { cn } from "@/lib/utils";

export function TutorConsentPanel({
  exploreOptIn,
  exploreOptInAt,
  exploreConsentEvidence,
  linkedAcademyName,
  linkedNeedsAcademyConsent,
  busy,
  defaultAcceptorName,
  onSignExplore,
  onRevokeExplore,
  onSignAcademy,
}: {
  exploreOptIn: boolean;
  exploreOptInAt?: string | null;
  exploreConsentEvidence?: TutorExploreConsentEvidence | null;
  linkedAcademyName?: string | null;
  /** Hay vínculo con plantel pero la ficha de academia aún no tiene consentimiento. */
  linkedNeedsAcademyConsent?: boolean;
  busy?: boolean;
  defaultAcceptorName?: string;
  onSignExplore: (acceptorName: string) => void | Promise<void>;
  onRevokeExplore: () => void | Promise<void>;
  onSignAcademy?: (acceptorName: string) => void | Promise<void>;
}) {
  const [ack, setAck] = useState(false);
  const [acceptorName, setAcceptorName] = useState(
    () => defaultAcceptorName?.trim() || exploreConsentEvidence?.acceptor_name || "",
  );
  const signedAt = exploreOptInAt
    ? new Date(exploreOptInAt).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const canSign = ack && acceptorName.trim().length >= 3;

  return (
    <div className="space-y-3 rounded-xl border border-mf-border bg-mf-canvas px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-mf-gph-ink">
          Consentimiento para Explorar
        </p>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
          Sin esta firma, la ficha <strong>no aparece</strong> en el buscador de
          talento. Crear la ficha no es suficiente: hay que autorizar su publicación.
        </p>
      </div>

      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        <li className="rounded-lg border border-mf-border bg-white px-3 py-2.5">
          <p className="font-semibold text-mf-gph-ink">Siempre funciona</p>
          <p className="mt-1 leading-5 text-mf-text-secondary">
            El link / código MF- que tú compartes (WhatsApp, academia, etc.).
          </p>
        </li>
        <li
          className={cn(
            "rounded-lg border px-3 py-2.5",
            exploreOptIn
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          )}
        >
          <p
            className={cn(
              "font-semibold",
              exploreOptIn ? "text-emerald-950" : "text-amber-950",
            )}
          >
            {exploreOptIn ? "Visible en Explorar" : "Oculta en Explorar"}
          </p>
          <p
            className={cn(
              "mt-1 leading-5",
              exploreOptIn ? "text-emerald-900/85" : "text-amber-950/85",
            )}
          >
            {exploreOptIn
              ? "Agentes y scouts pueden encontrarla en el directorio."
              : "Nadie la encuentra en el buscador hasta que firmes abajo."}
          </p>
        </li>
      </ul>

      {exploreOptIn ? (
        <div className="space-y-3">
          <FounderBadge />
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
            Consentimiento activo
            {signedAt ? ` · firmado ${signedAt}` : ""}. Visible en el buscador si la ficha
            tiene datos básicos (nombre, categoría, posición).
            {exploreConsentEvidence?.acceptor_name ? (
              <p className="mt-1 text-xs leading-5 text-emerald-900/80">
                Firmado por {exploreConsentEvidence.acceptor_name}
                {exploreConsentEvidence.consent_version
                  ? ` · ${exploreConsentEvidence.consent_version}`
                  : ""}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/fut/explorar" target="_blank" className="font-semibold underline">
                Ver Explorar
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onRevokeExplore()}
                className="font-semibold text-mf-gph underline disabled:opacity-50"
              >
                Retirar consentimiento
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <p className="font-semibold text-base">Firma para publicar en Explorar</p>
          <p className="mt-1 leading-6">
            Autorizas a MiFicha a mostrar la ficha del jugador en el directorio público,
            conforme al{" "}
            <Link href={LEGAL_ROUTES.privacy} className="font-semibold underline">
              aviso de privacidad
            </Link>
            . Guardamos tu nombre, cuenta, fecha y evidencia técnica de la firma.
          </p>
          <label className="mt-3 block text-sm">
            <span className="font-medium">Tu nombre completo</span>
            <input
              type="text"
              value={acceptorName}
              onChange={(event) => setAcceptorName(event.target.value)}
              placeholder="Como aparece en tu identificación"
              className="mf-input mt-1"
              autoComplete="name"
            />
          </label>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={ack}
              onChange={(event) => setAck(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-mf-border"
            />
            <span className="text-sm leading-6">{PRIVACY_COPY.tutorConsentLabel}</span>
          </label>
          <button
            type="button"
            disabled={busy || !canSign}
            onClick={() => void onSignExplore(acceptorName.trim())}
            className={cn(
              "mf-btn-gph mt-3 w-full sm:w-auto",
              (busy || !canSign) && "pointer-events-none opacity-50",
            )}
          >
            Firmar y publicar en Explorar
          </button>
          <p className="mt-2 text-xs leading-5 text-amber-900/75">
            Puedes retirar el consentimiento cuando quieras. El link MF- sigue activo.
          </p>
        </div>
      )}

      {linkedNeedsAcademyConsent && onSignAcademy ? (
        <div className="rounded-lg border border-mf-border bg-white px-3 py-2.5 text-sm text-mf-text-secondary">
          <p className="font-semibold text-mf-gph-ink">
            Ficha de academia pendiente
            {linkedAcademyName ? ` · ${linkedAcademyName}` : ""}
          </p>
          <p className="mt-1 leading-6">
            Hay vínculo con el plantel, pero la ficha oficial de torneo aún no tiene tu
            consentimiento. Puedes aprobarla aquí.
          </p>
          {!exploreOptIn ? (
            <p className="mt-2 text-xs leading-5 text-mf-text-muted">
              Completa nombre y casilla de arriba para firmar ambos consentimientos.
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy || (!exploreOptIn && !canSign)}
            onClick={() => void onSignAcademy(acceptorName.trim())}
            className="mf-btn-gph-ghost mt-3 disabled:opacity-50"
          >
            Aprobar ficha de academia
          </button>
        </div>
      ) : null}
    </div>
  );
}
