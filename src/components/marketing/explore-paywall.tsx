import Link from "next/link";
import { Lock, Search } from "lucide-react";
import {
  SCOUT_PRODUCT,
  scoutWhatsAppCheckoutHref,
  type ExploreAccess,
} from "@/lib/scout-product";

export function ExplorePaywallBanner({ access }: { access: ExploreAccess }) {
  if (access.unlocked) {
    const label =
      access.reason === "scout_sub"
        ? "Acceso completo · membresía persona"
        : access.reason === "admin"
          ? "Acceso completo · superadmin / staff"
          : access.reason === "owner"
            ? "Acceso completo · tu ficha"
            : "Acceso completo";
    return (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        {label}. Puedes abrir fichas con fotos, videos, contacto y detalle.
      </div>
    );
  }

  return (
    <aside
      id="pro"
      className="mb-8 scroll-mt-24 overflow-hidden rounded-2xl border border-mf-border bg-white"
    >
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="px-5 py-6 sm:px-6">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            <Search className="h-3.5 w-3.5" aria-hidden />
            Membresía persona
          </p>
          <h2 className="mt-2 text-xl font-semibold text-mf-gph-ink">
            {SCOUT_PRODUCT.headline}
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            {SCOUT_PRODUCT.summary}
          </p>
          <ul className="mt-4 space-y-1.5 text-sm leading-6 text-mf-text-secondary">
            {SCOUT_PRODUCT.includes.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-mf-text-muted">
            Solo aparecen jugadores cuyo tutor o representante dio consentimiento (opt-in) para
            compartir la ficha en Explorar.
          </p>
        </div>
        <div className="border-t border-mf-border bg-mf-canvas px-5 py-6 sm:px-6 lg:border-l lg:border-t-0">
          <p className="text-3xl font-semibold text-mf-gph-ink">
            {SCOUT_PRODUCT.priceLabel}
            <span className="ml-1 text-base font-medium text-mf-text-muted">
              {SCOUT_PRODUCT.currency} {SCOUT_PRODUCT.period}
            </span>
          </p>
          <p className="mt-2 text-sm text-mf-text-secondary">
            Incluye publicar fichas y desbloquear detalle, fotos y contacto de terceros.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a
              href={scoutWhatsAppCheckoutHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mf-btn-gph justify-center"
            >
              Contratar membresía
            </a>
            <Link href="/fut/entrar" className="mf-btn-gph-ghost justify-center">
              Entrar y publicar ficha
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function FichaLockedTeaser({
  name,
  position,
  category,
  place,
  code,
}: {
  name: string;
  position?: string | null;
  category?: string | null;
  place?: string | null;
  code?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-mf-border bg-white">
      <div className="bg-gradient-to-br from-[#0a1f3d] via-[#123d68] to-[#0f2d52] px-5 py-8 text-white sm:px-7">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Vista básica
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
        <p className="mt-2 text-sm text-white/75">
          {[position, category, place].filter(Boolean).join(" · ") || "Jugador en MiFicha"}
        </p>
        {code ? (
          <p className="mt-3 font-mono text-sm font-semibold text-emerald-300">{code}</p>
        ) : null}
      </div>
      <div className="space-y-4 px-5 py-6 sm:px-7">
        <p className="text-sm leading-7 text-mf-text-secondary">
          Fotos, videos, historia, contacto y ficha completa se desbloquean con la{" "}
          <strong>membresía persona</strong> ({SCOUT_PRODUCT.exploreProLabel},{" "}
          {SCOUT_PRODUCT.priceLabel} {SCOUT_PRODUCT.currency}/año).
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={scoutWhatsAppCheckoutHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn-gph"
          >
            Contratar · {SCOUT_PRODUCT.priceLabel} USD/año
          </a>
          <Link href="/fut/explorar#pro" className="mf-btn-gph-ghost">
            Ver membresía
          </Link>
        </div>
      </div>
    </div>
  );
}
