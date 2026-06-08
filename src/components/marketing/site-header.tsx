import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { SiteNavDesktop, SiteNavMobile } from "@/components/marketing/site-nav";
import { LEGAL_ROUTES } from "@/lib/legal";

interface SiteHeaderProps {
  actionHref?: string;
  actionLabel?: string;
}

export function SiteHeader({
  actionHref = "/login",
  actionLabel = "Iniciar sesión",
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-mf-border bg-mf-surface/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <BrandLogoLink className="shrink-0" />

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <SiteNavDesktop />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href={actionHref} className="mf-btn-ghost hidden sm:inline-flex">
            {actionLabel}
          </Link>
          <Link href="/signup" className="mf-btn-primary hidden sm:inline-flex">
            Registrar academia
          </Link>
          <SiteNavMobile actionHref={actionHref} actionLabel={actionLabel} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mf-text-secondary">
          <Link href="/#funciones" className="transition hover:text-mf-text">
            Funciones
          </Link>
          <Link href="/#accesos" className="transition hover:text-mf-text">
            Accesos
          </Link>
          <Link href="/explorar" className="transition hover:text-mf-text">
            Explorar
          </Link>
          <Link href="/padres" className="transition hover:text-mf-text">
            Padres
          </Link>
          <Link href={LEGAL_ROUTES.privacy} className="transition hover:text-mf-text">
            Privacidad
          </Link>
          <Link href={LEGAL_ROUTES.terms} className="transition hover:text-mf-text">
            Términos
          </Link>
          <Link href={LEGAL_ROUTES.cookies} className="transition hover:text-mf-text">
            Cookies
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-mf-border px-4 py-8 text-sm text-mf-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogoLink size="sm" />
        <div className="flex flex-wrap items-center gap-4">
          <Link href={LEGAL_ROUTES.privacy} className="hover:text-mf-text">
            Aviso de privacidad
          </Link>
          <Link href={LEGAL_ROUTES.terms} className="hover:text-mf-text">
            Términos
          </Link>
          <Link href={LEGAL_ROUTES.cookies} className="hover:text-mf-text">
            Cookies
          </Link>
          <p>© 2026 MiFicha · mificha.mx</p>
        </div>
      </div>
    </footer>
  );
}
