"use client";

import { useMemo, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";

export function TutorShareActions({
  playerName,
  sharePath,
  publicCode,
}: {
  playerName: string;
  sharePath: string;
  publicCode?: string | null;
}) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const absoluteUrl = useMemo(() => {
    if (typeof window === "undefined") return sharePath;
    try {
      return new URL(sharePath, window.location.origin).toString();
    } catch {
      return sharePath;
    }
  }, [sharePath]);

  const whatsappHref = useMemo(() => {
    const text = publicCode
      ? `Mira la ficha de ${playerName} en MiFicha (${publicCode}): ${absoluteUrl}`
      : `Mira la ficha de ${playerName} en MiFicha: ${absoluteUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [absoluteUrl, playerName, publicCode]);

  async function copy(kind: "link" | "code", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white px-4 py-4 shadow-[var(--mf-shadow)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 print:hidden">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Compartir ficha
        </p>
        <p className="mt-1 truncate text-sm text-mf-text-secondary">
          Link listo para visores, universidades o academias
          {publicCode ? ` · ${publicCode}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-accent-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#047857]"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => void copy("link", absoluteUrl)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
        >
          <Copy className="h-4 w-4" />
          {copied === "link" ? "Link copiado" : "Copiar link"}
        </button>
        {publicCode ? (
          <button
            type="button"
            onClick={() => void copy("code", publicCode)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-4 py-2.5 text-sm font-semibold text-mf-brand hover:bg-mf-canvas"
          >
            {copied === "code" ? "Código copiado" : "Copiar código"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
