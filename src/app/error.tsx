"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandLogoLink } from "@/components/ui/brand-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mf-canvas px-6">
      <div className="w-full max-w-md mf-card p-8 text-center">
        <BrandLogoLink className="justify-center" />
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
          Algo falló
        </h1>
        <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
          No pudimos cargar esta página. Intenta de nuevo; si sigue, vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="mf-btn-primary">
            Reintentar
          </button>
          <Link href="/fut" className="mf-btn-gph-ghost">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
