"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, MessageCircle, Printer, Share2 } from "lucide-react";
import { PLAYER_CODE_SHORT } from "@/lib/player-public-code-copy";

export function TutorShareActions({
  playerName,
  sharePath,
  absoluteUrl,
  publicCode,
}: {
  playerName: string;
  sharePath: string;
  absoluteUrl?: string;
  publicCode?: string | null;
}) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const resolvedUrl = useMemo(() => {
    if (absoluteUrl) return absoluteUrl;
    if (typeof window === "undefined") return sharePath;
    try {
      return new URL(sharePath, window.location.origin).toString();
    } catch {
      return sharePath;
    }
  }, [absoluteUrl, sharePath]);

  const whatsappHref = useMemo(() => {
    const text = publicCode
      ? `Mira la ficha de ${playerName} en MiFicha (${publicCode}): ${resolvedUrl}`
      : `Mira la ficha de ${playerName} en MiFicha: ${resolvedUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [resolvedUrl, playerName, publicCode]);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copy(kind: "link" | "code", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  async function shareNative() {
    try {
      await navigator.share({
        title: `${playerName} · MiFicha`,
        text: publicCode
          ? `Ficha de ${playerName} (${publicCode})`
          : `Ficha de ${playerName}`,
        url: resolvedUrl,
      });
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white/90 px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 print:hidden">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Compartir
        </p>
        <p className="mt-0.5 text-sm text-mf-text-secondary">
          {publicCode ? (
            <>
              <span className="font-mono font-semibold text-mf-gph-ink">{publicCode}</span>
              {" · "}
              {PLAYER_CODE_SHORT}
            </>
          ) : (
            "Link listo para visores, universidades o academias"
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-accent-dark px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#047857]"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        {canNativeShare ? (
          <button
            type="button"
            onClick={() => void shareNative()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void copy("link", resolvedUrl)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
        >
          <Copy className="h-4 w-4" />
          {copied === "link" ? "Link copiado" : "Copiar link"}
        </button>
        {publicCode ? (
          <button
            type="button"
            onClick={() => void copy("code", publicCode)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-brand hover:bg-mf-canvas"
          >
            {copied === "code" ? "Código copiado" : "Código"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-gph hover:bg-mf-gph-soft"
        >
          <Printer className="h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  );
}
