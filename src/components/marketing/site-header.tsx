import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { SiteNavDesktop, SiteNavMobile } from "@/components/marketing/site-nav";
import { SponsorSlot } from "@/components/marketing/sponsor-slot";
import { LEGAL_ROUTES } from "@/lib/legal";

interface SiteHeaderProps {
  actionHref?: string;
  actionLabel?: string;
}

export function SiteHeader({
  actionHref = "/fut/entrar",
  actionLabel = "Entrar",
}: SiteHeaderProps) {
  return (
    <header className="mf-safe-top relative sticky top-0 z-50">
      <div
        className="pointer-events-none absolute inset-0 border-b border-mf-border bg-mf-surface/95 backdrop-blur-sm"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-mf-brand via-mf-accent/80 to-mf-brand" />
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <BrandLogoLink href="/fut" className="shrink-0" />

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <SiteNavDesktop />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/fut/login"
            className="hidden text-sm font-medium text-mf-text-secondary transition hover:text-mf-text lg:inline-flex"
          >
            Academia
          </Link>
          <Link href={actionHref} className="mf-btn-gph hidden sm:inline-flex">
            {actionLabel}
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
      <SponsorSlot placement="footer_rail" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mf-text-secondary">
          <Link href="/fut/planes" className="transition hover:text-mf-text">
            Planes
          </Link>
          <Link href="/fut/productos" className="transition hover:text-mf-text">
            Productos
          </Link>
          <Link href="/fut/noticias" className="transition hover:text-mf-text">
            Noticias
          </Link>
          <Link href="/fut/visorias" className="transition hover:text-mf-text">
            Visorías
          </Link>
          <Link href="/fut/eventos" className="transition hover:text-mf-text">
            Eventos
          </Link>
          <Link href="/fut/convocatorias" className="transition hover:text-mf-text">
            Convocatorias
          </Link>
          <Link href="/fut#como-funciona" className="transition hover:text-mf-text">
            Cómo funciona
          </Link>
          <Link href="/fut/entrar" className="transition hover:text-mf-text">
            Entrar
          </Link>
          <Link href={LEGAL_ROUTES.privacy} className="transition hover:text-mf-text">
            Privacidad
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-mf-border px-4 py-8 text-sm text-mf-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogoLink href="/fut" size="sm" />
        <div className="flex flex-col gap-2 sm:items-end">
          <p className="text-mf-text-secondary">
            <a href="mailto:hola@mificha.mx" className="font-medium text-mf-brand hover:underline">
              hola@mificha.mx
            </a>
          </p>
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
            <p>
              © 2026 <BrandWordmark />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
