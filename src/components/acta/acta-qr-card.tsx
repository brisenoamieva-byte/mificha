"use client";

import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ActaQrCardProps {
  label: string;
  url: string;
  size?: number;
}

export function ActaQrCard({ label, url, size = 160 }: ActaQrCardProps) {
  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  return (
    <div className="rounded-xl border border-mf-border bg-white p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-mf-text-muted">
        {label}
      </p>
      <div className="mx-auto mt-3 inline-flex rounded-xl bg-white p-2 ring-1 ring-mf-border-subtle">
        <QRCode value={url} size={size} />
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-mf-brand hover:underline"
      >
        <Copy className="h-3.5 w-3.5" />
        Copiar link
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block break-all text-[10px] leading-4 text-mf-text-muted"
      >
        {url}
      </a>
    </div>
  );
}
