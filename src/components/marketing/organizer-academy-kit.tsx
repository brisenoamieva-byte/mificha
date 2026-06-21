"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import {
  buildOrganizerAcademyBlastText,
  ORGANIZER_ONE_PAGER,
} from "@/lib/organizer-one-pager";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const DEFAULT_TOURNAMENT = "Interescolar MiFicha";

interface OrganizerAcademyKitProps {
  embedded?: boolean;
}

export function OrganizerAcademyKit({ embedded = false }: OrganizerAcademyKitProps) {
  const [copied, setCopied] = useState(false);
  const blastText = buildOrganizerAcademyBlastText({
    tournamentName: DEFAULT_TOURNAMENT,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(blastText);
    setCopied(true);
    toast.success("Mensaje copiado.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn(embedded ? "mt-10 border-t border-mf-border pt-10" : "border-b border-mf-border bg-mf-surface")}>
      <div className={cn(!embedded && "mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16")}>
        <div className="max-w-2xl">
          {!embedded ? (
            <p className="mf-marketing-eyebrow">Para tus academias</p>
          ) : null}
          <h2
            className={cn(
              "font-semibold tracking-[-0.02em] text-mf-text",
              embedded ? "text-lg" : "mt-3 text-2xl",
            )}
          >
            {ORGANIZER_ONE_PAGER.academyKitTitle}
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            {ORGANIZER_ONE_PAGER.academyKitDescription}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-mf-border bg-mf-canvas p-4 sm:p-5">
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-7 text-mf-text-secondary">
            {blastText}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2 text-sm font-semibold text-mf-brand transition hover:bg-mf-surface"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied ? "Copiado" : "Copiar mensaje"}
          </button>
        </div>
      </div>
    </div>
  );
}
