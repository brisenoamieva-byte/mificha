"use client";

import { useState } from "react";
import Link from "next/link";
import { LEGAL_ROUTES } from "@/lib/legal";
import { PRIVACY_COPY } from "@/lib/privacy";
import { cn } from "@/lib/utils";

export function TutorConsentPanel({
  exploreOptIn,
  exploreOptInAt,
  linkedAcademyName,
  linkedNeedsAcademyConsent,
  busy,
  onSignExplore,
  onRevokeExplore,
  onSignAcademy,
}: {
  exploreOptIn: boolean;
  exploreOptInAt?: string | null;
  linkedAcademyName?: string | null;
  /** Hay vínculo con plantel pero la ficha de academia aún no tiene consentimiento. */
  linkedNeedsAcademyConsent?: boolean;
  busy?: boolean;
  onSignExplore: () => void | Promise<void>;
  onRevokeExplore: () => void | Promise<void>;
  onSignAcademy?: () => void | Promise<void>;
}) {
  const [ack, setAck] = useState(false);
  const signedAt = exploreOptInAt
    ? new Date(exploreOptInAt).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-3 rounded-xl border border-mf-border bg-mf-canvas px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-mf-gph-ink">
          Consentimiento · compartir ficha
        </p>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
          Sin tu aprobación, la ficha <strong>no</strong> aparece en Explorar ni se promociona.
          El link directo (código MF-) sigue funcionando para quien ya lo tenga.
        </p>
      </div>

      {exploreOptIn ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          Consentimiento activo
          {signedAt ? ` · firmado ${signedAt}` : ""}. Visible en el buscador si la ficha tiene
          contenido suficiente.
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
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
          <p className="font-semibold">Sin consentimiento para Explorar</p>
          <p className="mt-1 leading-6">
            Actívalo solo si autorizas tratar y compartir los datos deportivos del jugador
            conforme al{" "}
            <Link href={LEGAL_ROUTES.privacy} className="font-semibold underline">
              aviso de privacidad
            </Link>
            .
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={ack}
              onChange={(event) => setAck(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-mf-border"
            />
            <span className="text-sm leading-6">{PRIVACY_COPY.consentLabel}</span>
          </label>
          <button
            type="button"
            disabled={busy || !ack}
            onClick={() => void onSignExplore()}
            className={cn(
              "mf-btn-gph mt-3",
              (busy || !ack) && "pointer-events-none opacity-50",
            )}
          >
            Firmar y publicar en Explorar
          </button>
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
          <button
            type="button"
            disabled={busy || (!exploreOptIn && !ack)}
            onClick={() => void onSignAcademy()}
            className="mf-btn-gph-ghost mt-3 disabled:opacity-50"
          >
            Aprobar ficha de academia
          </button>
        </div>
      ) : null}
    </div>
  );
}
