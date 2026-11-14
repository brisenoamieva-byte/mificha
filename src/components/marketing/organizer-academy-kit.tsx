"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import {
  buildOrganizerAcademyBlastText,
  ORGANIZER_ONE_PAGER,
} from "@/lib/organizer-one-pager";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface OrganizerAcademyKitProps {
  embedded?: boolean;
}

export function OrganizerAcademyKit({ embedded = false }: OrganizerAcademyKitProps) {
  const [copied, setCopied] = useState(false);
  const [tournamentName, setTournamentName] = useState("");

  const blastText = useMemo(
    () =>
      buildOrganizerAcademyBlastText({
        tournamentName: tournamentName.trim() || "nuestro torneo",
      }),
    [tournamentName],
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(blastText);
    setCopied(true);
    toast.success("Mensaje copiado. Ya lo puedes pegar a las academias.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        embedded
          ? "mt-10 border-t border-mf-border pt-10"
          : "border-b border-mf-border bg-mf-surface",
      )}
    >
      <div className={cn(!embedded && "mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16")}>
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Para enviar a escuelas</p>
          <h2
            className={cn(
              "font-semibold tracking-[-0.02em] text-mf-text",
              embedded ? "mt-2 text-lg" : "mt-3 text-2xl",
            )}
          >
            {ORGANIZER_ONE_PAGER.academyKitTitle}
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            {ORGANIZER_ONE_PAGER.academyKitDescription}
          </p>
        </div>

        <label className="mt-5 block max-w-md text-sm font-medium text-mf-text">
          Nombre de tu torneo
          <input
            type="text"
            value={tournamentName}
            onChange={(event) => setTournamentName(event.target.value)}
            placeholder="Ej. Interescolar Querétaro 2026"
            className="mf-input mt-1.5"
          />
        </label>

        <div className="mt-4 rounded-xl border border-mf-border bg-mf-canvas p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
            Vista previa del WhatsApp a academias
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-mf-text-secondary">
            {blastText}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-brand transition hover:bg-mf-surface"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied ? "Copiado" : "Copiar para enviar a academias"}
          </button>
        </div>
      </div>
    </div>
  );
}
