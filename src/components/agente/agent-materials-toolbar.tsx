"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function AgentMaterialsToolbar({ playerName }: { playerName: string }) {
  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute("data-agent-print");
    };
  }, []);

  function printFicha() {
    document.documentElement.setAttribute("data-agent-print", "ficha");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.documentElement.removeAttribute("data-agent-print");
      }, 300);
    }, 50);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-mf-border bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 print:hidden">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Kit de materiales
        </p>
        <p className="mt-0.5 text-sm text-mf-text-secondary">
          {playerName} · ficha lista para PDF
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={printFicha}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mf-gph px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#163f70]"
        >
          <Printer className="h-4 w-4" />
          PDF ficha
        </button>
      </div>
    </div>
  );
}
