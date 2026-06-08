"use client";

import { Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { hasPublicConsent } from "@/lib/privacy";
import {
  buildPlayerShareUrl,
  buildPlayerWhatsAppShareUrl,
} from "@/lib/share-ficha";
import { cn } from "@/lib/utils";

interface SharePlayerButtonProps {
  slug: string;
  firstName: string;
  lastName: string;
  isPublic: boolean;
  publicConsentAt?: string | null;
  compact?: boolean;
  className?: string;
}

export function SharePlayerButton({
  slug,
  firstName,
  lastName,
  isPublic,
  publicConsentAt,
  compact = false,
  className,
}: SharePlayerButtonProps) {
  const [copied, setCopied] = useState(false);
  const canShare = hasPublicConsent({
    is_public: isPublic,
    public_consent_at: publicConsentAt,
  });

  async function handleCopy() {
    if (!canShare) {
      toast.error(
        "Activa consentimiento parental y ficha pública en el jugador antes de compartir.",
      );
      return;
    }

    await navigator.clipboard.writeText(buildPlayerShareUrl(slug));
    setCopied(true);
    toast.success("Link copiado. Para envío automático, usa Avisos a tutores.");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    if (!canShare) {
      toast.error(
        "Activa consentimiento parental y ficha pública en el jugador antes de compartir.",
      );
      return;
    }

    window.open(
      buildPlayerWhatsAppShareUrl(slug, firstName, lastName),
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="rounded-lg p-2 text-green-700 hover:bg-green-50"
          title="WhatsApp manual (respaldo)"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          title={copied ? "Copiado" : "Copiar link"}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp manual
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  );
}
