import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";

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
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogoLink />
        <div className="flex items-center gap-2">
          <Link href={actionHref} className="mf-btn-ghost">
            {actionLabel}
          </Link>
          <Link href="/signup" className="mf-btn-primary hidden sm:inline-flex">
            Registrar academia
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-mf-border bg-mf-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-mf-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogoLink showWordmark wordmarkClassName="text-mf-text-secondary" />
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/aviso-privacidad" className="hover:text-mf-text">
            Aviso de privacidad
          </Link>
          <p>© 2026 MiFicha · mificha.mx</p>
        </div>
      </div>
    </footer>
  );
}
