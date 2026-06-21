"use client";

import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import { FichaDocument } from "@/components/ficha/ficha-document";
import { buildDemoFichaDocument } from "@/lib/ficha-document-model";

const DEMO_FICHA_HREF = "/j/santiago-hernandez-demo";

interface HomeFichaPreviewProps {
  /** Recorta la ficha para el hero — evita hueco bajo el copy. */
  variant?: "hero" | "full";
}

export function HomeFichaPreview({ variant = "hero" }: HomeFichaPreviewProps) {
  const model = buildDemoFichaDocument();
  const isHero = variant === "hero";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="demo-ficha-shell relative mx-auto w-full min-w-0 max-w-[680px] lg:mx-0">
      <FichaDocument model={model} priorityPhoto variant={variant} />

      <div className="demo-ficha-actions mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-5 text-mf-text-muted">
          {isHero
            ? "Ejemplo · stats del torneo"
            : "Ejemplo · formato carta · stats del torneo + evaluación del entrenador"}
        </p>
        {!isHero ? (
          <button
            type="button"
            onClick={handlePrint}
            className="demo-ficha-print-btn inline-flex items-center gap-1.5 rounded-lg border border-mf-border bg-white px-3 py-1.5 text-[11px] font-semibold text-mf-brand shadow-sm transition hover:bg-mf-canvas"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Imprimir ejemplo
          </button>
        ) : (
          <Link
            href={DEMO_FICHA_HREF}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-mf-brand hover:underline"
          >
            Ficha completa
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
