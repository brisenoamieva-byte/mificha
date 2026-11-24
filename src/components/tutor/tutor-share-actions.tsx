"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Download,
  FileText,
  MessageCircle,
  Printer,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { trackProductEvent } from "@/lib/product-analytics";
import { PLAYER_CODE_SHORT } from "@/lib/player-public-code-copy";
import {
  buildInviteTeammateWhatsAppHref,
  buildPlayerShareWhatsAppText,
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
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<"og" | "story" | null>(null);
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

  const imagePath = useMemo(
    () => `${sharePath.replace(/\/$/, "")}/opengraph-image`,
    [sharePath],
  );
  const storyPath = useMemo(
    () => `${sharePath.replace(/\/$/, "")}/story-image`,
    [sharePath],
  );

  const whatsappHref = useMemo(() => {
    const text = buildPlayerShareWhatsAppText({
      playerName,
      publicCode,
      shareUrl: resolvedUrl,
    });
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      trackProductEvent("share_click", { channel: "copy", kind: "link" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function shareNative() {
    try {
      await navigator.share({
        title: `${playerName} · MiFicha`,
        text: publicCode
          ? `Esta es mi ficha (${publicCode})`
          : `Esta es mi ficha en MiFicha`,
        url: resolvedUrl,
      });
      trackProductEvent("share_click", { channel: "native" });
    } catch {
      /* cancelled */
    }
  }

  async function downloadImage(kind: "og" | "story") {
    setDownloading(kind);
    try {
      const path = kind === "story" ? storyPath : imagePath;
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("download_failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(publicCode || "ficha").toLowerCase()}-mificha${
        kind === "story" ? "-story" : ""
      }.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackProductEvent("share_click", {
        channel: kind === "story" ? "download_story" : "download_image",
      });
    } catch {
      /* ignore */
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white/90 px-4 py-3.5 sm:px-5 print:hidden">
      <div>
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
            "Mándala al equipo, a stories o por WhatsApp"
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
        <button
          type="button"
          onClick={() => void downloadImage("story")}
          disabled={downloading !== null}
          title="Imagen vertical 9:16 para Instagram Stories, Reels o estado de WhatsApp."
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70] disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {downloading === "story" ? "Guardando…" : "Story"}
        </button>
        <button
          type="button"
          onClick={() => void downloadImage("og")}
          disabled={downloading !== null}
          title="Tarjeta horizontal para chats y portada de link."
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {downloading === "og" ? "Guardando…" : "Tarjeta chat"}
        </button>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Link copiado" : "Copiar link"}
        </button>
        {canNativeShare ? (
          <button
            type="button"
            onClick={() => void shareNative()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
          >
            <Share2 className="h-4 w-4" />
            Más
          </button>
        ) : null}
      </div>

      <p className="text-xs leading-5 text-mf-text-muted">
        <span className="font-semibold text-mf-text-secondary">Story</span> es vertical
        para Instagram / WhatsApp. La tarjeta chat sirve en grupos. La ficha completa
        está en el PDF o abriendo el link.
      </p>

      <div className="border-t border-mf-border/80 pt-3 text-sm">
        {materialsKitHref ? (
          <Link
            href={materialsKitHref}
            className="inline-flex items-center gap-1.5 font-semibold text-mf-gph hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            Descargar PDF completo
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 font-semibold text-mf-gph hover:underline"
          >
            <Printer className="h-3.5 w-3.5" />
            Descargar PDF completo
          </button>
        )}
      </div>

      <div className="rounded-xl border border-mf-gph/20 bg-mf-gph-soft/70 px-3.5 py-3">
        <p className="text-sm font-semibold text-mf-gph-ink">
          Invita a tu equipo
        </p>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
          Que tus compañeros armen la suya. Entre más fichas del equipo, más se ve
          su ciudad en el mapa.
        </p>
        <a
          href={inviteHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackProductEvent("invite_click", { channel: "whatsapp" })}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70]"
        >
          <UserPlus className="h-4 w-4" />
          Invitar compañeros
        </a>
      </div>
    </div>
  );
}
