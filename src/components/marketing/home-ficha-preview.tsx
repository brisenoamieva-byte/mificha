"use client";

import { Printer } from "lucide-react";
import { FichaDocument } from "@/components/ficha/ficha-document";
import { buildDemoFichaDocument } from "@/lib/ficha-document-model";

export function HomeFichaPreview() {
  const model = buildDemoFichaDocument();

  function handlePrint() {
    window.print();
  }

  return (
    <div className="demo-ficha-shell relative mx-auto w-full min-w-0 max-w-[780px] lg:mx-0">
      <FichaDocument model={model} priorityPhoto />

      <div className="demo-ficha-actions mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-5 text-mf-text-muted">
          Ejemplo · formato carta · stats del torneo + evaluación del entrenador
        </p>
        <button
          type="button"
          onClick={handlePrint}
          className="demo-ficha-print-btn inline-flex items-center gap-1.5 rounded-lg border border-mf-border bg-white px-3 py-1.5 text-[11px] font-semibold text-mf-brand shadow-sm transition hover:bg-mf-canvas"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          Imprimir ejemplo
        </button>
      </div>
    </div>
  );
}
