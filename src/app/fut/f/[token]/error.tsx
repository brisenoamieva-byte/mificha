"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandLogoLink } from "@/components/ui/brand-logo";

export default function FichaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ficha-error]", error.digest || error.message);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-mf-canvas px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-mf-border bg-white p-8 text-center shadow-[var(--mf-shadow)]">
        <BrandLogoLink className="justify-center" />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-mf-gph-ink">
          No se pudo abrir la ficha
        </h1>
        <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
          Hubo un problema temporal al cargar. Reintenta o abre Explorar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="mf-btn-gph">
            Reintentar
          </button>
          <Link href="/fut/explorar" className="mf-btn-gph-ghost">
            Ver Explorar
          </Link>
        </div>
      </div>
    </div>
  );
}
