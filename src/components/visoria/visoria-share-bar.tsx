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
    <div className="grid gap-5 rounded-2xl border border-mf-gph/20 bg-white p-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="mx-auto rounded-xl bg-white p-3 ring-1 ring-mf-border">
        <QRCode value={url} size={132} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Comparte el registro
        </p>
        <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
          Un solo link. Lo mandas por WhatsApp, lo pones en el cartel o lo enseñas en
          recepción. Quien lo abre llena el formulario y cae en la base de MiFicha.
        </p>
        <p className="mt-2 break-all text-xs font-medium text-mf-gph-ink">{url}</p>
        <div className="mt-4 flex flex-wrap gap-2">
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
