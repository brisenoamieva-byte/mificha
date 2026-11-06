"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "@/components/ui/toast";
import { visoriaPublicUrl, visoriaWhatsAppShareHref } from "@/lib/visoria-event";

export function VisoriaShareBar() {
  const [url, setUrl] = useState(visoriaPublicUrl());

  useEffect(() => {
    setUrl(`${window.location.origin}/fut/visorias`);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Liga copiada. Pégala en WhatsApp o en el QR impreso.");
    } catch {
      toast.error("No se pudo copiar. Copia la barra de dirección.");
    }
  }

  return (
    <div className="grid gap-6 rounded-xl bg-mf-canvas px-5 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:px-7 sm:py-7">
      <div className="mx-auto rounded-lg bg-white p-3 ring-1 ring-mf-border">
        <QRCode value={url} size={128} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Un solo link
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
          Compártelo por WhatsApp o en recepción
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-mf-text-secondary">
          Quien abre la liga llena el formulario y cae en la base de MiFicha. Sin Google
          Forms.
        </p>
        <p className="mt-3 break-all font-mono text-[11px] text-mf-text-muted">{url}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={visoriaWhatsAppShareHref(url.replace(/\/fut\/visorias$/, ""))}
            className="mf-btn-gph"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mandar por WhatsApp
          </a>
          <button type="button" onClick={() => void copyLink()} className="mf-btn-gph-ghost">
            Copiar liga
          </button>
        </div>
      </div>
    </div>
  );
}
