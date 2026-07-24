import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";

/**
 * Hub raíz mificha.mx — elige deporte.
 * Fútbol vive en /fut · Pádel en /padel (otro deploy con basePath).
 */
export default function HubPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <header className="border-b border-mf-border bg-mf-surface">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <BrandLogoLink href="/" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mf-brand">
          MiFicha
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-mf-text sm:text-5xl">
          Tu ficha deportiva
        </h1>
        <p className="mt-3 max-w-xl text-base text-mf-text-secondary">
          Elige el deporte. Misma marca, productos distintos.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/fut"
            className="rounded-2xl border border-mf-border bg-mf-surface p-6 shadow-sm transition hover:border-mf-brand"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-mf-brand">
              Fútbol
            </p>
            <p className="mt-2 text-2xl font-bold text-mf-text">MiFicha Fútbol</p>
            <p className="mt-2 text-sm text-mf-text-secondary">
              Fichas, planteles y torneos escolares.
            </p>
            <p className="mt-4 text-sm font-semibold text-mf-brand">Entrar →</p>
          </Link>

          <Link
            href="/padel"
            className="rounded-2xl border border-mf-border bg-mf-surface p-6 shadow-sm transition hover:border-mf-brand"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-mf-brand">
              Pádel
            </p>
            <p className="mt-2 text-2xl font-bold text-mf-text">MiFicha Pádel</p>
            <p className="mt-2 text-sm text-mf-text-secondary">
              Clips, stats y sello en cancha.
            </p>
            <p className="mt-4 text-sm font-semibold text-mf-brand">Entrar →</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
