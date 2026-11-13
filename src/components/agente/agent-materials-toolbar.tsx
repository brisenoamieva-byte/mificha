"use client";

import { useEffect, useState } from "react";
import { Copy, FileText, Printer } from "lucide-react";
import type { AgentMaterialDoc } from "@/lib/agent-materials";

export function AgentMaterialsToolbar({
  playerName,
  fichaUrl,
  kitUrl,
}: {
  playerName: string;
  fichaUrl: string;
  kitUrl: string;
}) {
  const [copied, setCopied] = useState<"ficha" | "kit" | null>(null);

  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute("data-agent-print");
    };
  }, []);

  function printDoc(doc: AgentMaterialDoc) {
    document.documentElement.setAttribute("data-agent-print", doc);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.documentElement.removeAttribute("data-agent-print");
      }, 300);
    }, 50);
  }

  async function copy(kind: "ficha" | "kit", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 print:hidden">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Kit de materiales
        </p>
        <p className="mt-0.5 text-sm text-mf-text-secondary">
          {playerName} · currículum de agente + ficha listos para PDF
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => printDoc("onepager")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70]"
        >
          <FileText className="h-4 w-4" />
          PDF hoja de vida
        </button>
        <button
          type="button"
          onClick={() => printDoc("deck")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-gph-ink hover:bg-mf-canvas"
        >
          <FileText className="h-4 w-4" />
          PDF presentación
        </button>
        <button
          type="button"
          onClick={() => printDoc("ficha")}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-gph-ink hover:bg-mf-canvas"
        >
          <Printer className="h-4 w-4" />
          PDF ficha
        </button>
        <button
          type="button"
          onClick={() => void copy("ficha", fichaUrl)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
        >
          <Copy className="h-4 w-4" />
          {copied === "ficha" ? "Ficha copiada" : "Copiar link ficha"}
        </button>
        <button
          type="button"
          onClick={() => void copy("kit", kitUrl)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-mf-border bg-white px-3.5 py-2 text-sm font-semibold text-mf-text hover:bg-mf-canvas"
        >
          <Copy className="h-4 w-4" />
          {copied === "kit" ? "Kit copiado" : "Copiar link kit"}
        </button>
      </div>
    </div>
  );
}
