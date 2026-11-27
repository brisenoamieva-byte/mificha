import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { InstagramIcon } from "@/components/ui/instagram-icon";
import { SiteNavDesktop, SiteNavMobile } from "@/components/marketing/site-nav";
import { SponsorSlot } from "@/components/marketing/sponsor-slot";
import {
  BRAND_INSTAGRAM_HANDLE,
  BRAND_INSTAGRAM_URL,
  BRAND_WHATSAPP_DISPLAY,
} from "@/lib/brand";
import { LEGAL_ENTITY, LEGAL_ROUTES } from "@/lib/legal";
import { MISION_PATH } from "@/lib/mision";

interface SiteHeaderProps {
  actionHref?: string;
  actionLabel?: string;
  /** En cuenta persona (tutor) no mostrar atajo a academia. */
  showAcademyLink?: boolean;
  /** Solo logo + CTA (ficha pública / tutor). Sin menú marketing. */
  minimal?: boolean;
}

export function SiteHeader({
  actionHref = "/fut/entrar",
  actionLabel = "Entrar",
  showAcademyLink = true,
  minimal = false,
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

        {!minimal ? (
          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <SiteNavDesktop />
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {!minimal && showAcademyLink ? (
            <Link
              href="/fut/dashboard"
              className="hidden text-sm font-medium text-mf-text-secondary transition hover:text-mf-text lg:inline-flex"
            >
              Academia
            </Link>
          ) : null}
          <Link
            href={actionHref}
            className="mf-btn-gph inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            {actionLabel}
          </Link>
          {!minimal ? (
            <SiteNavMobile
              actionHref={actionHref}
              actionLabel={actionLabel}
              showAcademyLink={showAcademyLink}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mf-safe-bottom border-t border-mf-border bg-mf-surface">
      <SponsorSlot placement="footer_rail" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-center text-sm text-mf-text-secondary sm:justify-start sm:text-left">
          <Link href="/fut/app" className="font-semibold text-mf-brand transition hover:text-mf-gph">
            Descargar app
          </Link>
          <Link href="/fut/padres" className="transition hover:text-mf-text">
            Familias
          </Link>
          <Link href="/fut/productos" className="transition hover:text-mf-text">
            Productos
          </Link>
          <Link href="/fut/organizadores" className="transition hover:text-mf-text">
            Organizadores
          </Link>
          <Link href="/fut/visorias" className="transition hover:text-mf-text">
            Visorías
          </Link>
          <Link href="/fut/noticias" className="transition hover:text-mf-text">
            Noticias
          </Link>
          <Link href="/fut/eventos" className="transition hover:text-mf-text">
            Eventos
          </Link>
          <Link href="/fut/convocatorias" className="transition hover:text-mf-text">
            Convocatorias
          </Link>
          <Link href={MISION_PATH} className="transition hover:text-mf-text">
            Misión
          </Link>
          <Link href="/fut/entrar" className="transition hover:text-mf-text">
            Entrar
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 border-t border-mf-border px-4 py-8 text-center text-sm text-mf-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
        <BrandLogoLink href="/fut" size="sm" />
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-mf-text-secondary sm:justify-end">
            <a
              href={BRAND_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-mf-brand transition hover:text-mf-gph"
            >
              <InstagramIcon className="h-4 w-4" />
              {BRAND_INSTAGRAM_HANDLE}
            </a>
            <a href="mailto:hola@mificha.mx" className="font-medium text-mf-brand hover:underline">
              hola@mificha.mx
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
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
      <div className="mx-auto max-w-6xl border-t border-mf-border-subtle px-4 py-4 text-center text-xs leading-5 text-mf-text-muted sm:px-6 sm:text-left">
        <p>
          <BrandWordmark /> es una marca de {LEGAL_ENTITY.legalName}, persona física con
          actividad empresarial. Domicilio: {LEGAL_ENTITY.address}. WhatsApp{" "}
          {BRAND_WHATSAPP_DISPLAY} ·{" "}
          <a href={`mailto:${LEGAL_ENTITY.contactEmail}`} className="hover:text-mf-text">
            {LEGAL_ENTITY.contactEmail}
          </a>
        </p>
      </div>
    </footer>
  );
}
