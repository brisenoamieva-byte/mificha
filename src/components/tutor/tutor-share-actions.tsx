"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, FileText, MessageCircle, Printer, Share2, UserPlus } from "lucide-react";
import { trackProductEvent } from "@/lib/product-analytics";
import { PLAYER_CODE_SHORT } from "@/lib/player-public-code-copy";
import {
  buildInviteTeammateWhatsAppHref,
  withShareUtm,
} from "@/lib/viral-share";

export function TutorShareActions({
  playerName,
  sharePath,
  absoluteUrl,
  publicCode,
  materialsKitHref,
}: {
  playerName: string;
  sharePath: string;
  absoluteUrl?: string;
  publicCode?: string | null;
  /** Kit con PDF hoja de vida / presentación / ficha. */
  materialsKitHref?: string | null;
}) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const resolvedUrl = useMemo(() => {
    const base = absoluteUrl
      ? absoluteUrl
      : typeof window === "undefined"
        ? sharePath
        : (() => {
            try {
              return new URL(sharePath, window.location.origin).toString();
            } catch {
              return sharePath;
            }
          })();
    return withShareUtm(base, { campaign: "share_ficha", content: publicCode || "link" });
  }, [absoluteUrl, sharePath, publicCode]);

  const whatsappHref = useMemo(() => {
    const text = publicCode
      ? `Mira la ficha de ${playerName} en MiFicha (${publicCode}): ${resolvedUrl}`
      : `Mira la ficha de ${playerName} en MiFicha: ${resolvedUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [resolvedUrl, playerName, publicCode]);

  const inviteHref = useMemo(
    () =>
      buildInviteTeammateWhatsAppHref({
        playerName,
        publicCode,
        shareUrl: resolvedUrl,
      }),
    [playerName, publicCode, resolvedUrl],
  );

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function copy(kind: "link" | "code", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      trackProductEvent("share_click", { channel: "copy", kind });
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
      trackProductEvent("share_click", { channel: "native" });
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white/90 px-4 py-3.5 sm:px-5 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
            onClick={() => trackProductEvent("share_click", { channel: "whatsapp" })}
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
            Descargar PDF
          </button>
          {materialsKitHref ? (
            <Link
              href={materialsKitHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70]"
            >
              <FileText className="h-4 w-4" />
              Kit PDF
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-mf-gph/20 bg-mf-gph-soft/70 px-3.5 py-3">
        <p className="text-sm font-semibold text-mf-gph-ink">Invita a 3 padres del equipo</p>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
          Así se ve la ficha de {playerName}. Que armen la de su hijo en ~5 minutos.
        </p>
        <a
          href={inviteHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackProductEvent("invite_click", { channel: "whatsapp" })}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70]"
        >
          <UserPlus className="h-4 w-4" />
          Invitar compañero por WhatsApp
        </a>
      </div>
    </div>
  );
}
