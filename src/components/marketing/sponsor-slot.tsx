import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  getSponsorBrandsFor,
  getSponsorSlot,
  sponsorInquiryHref,
  type SponsorBrand,
  type SponsorPlacement,
} from "@/lib/sponsor-slots";
import { cn } from "@/lib/utils";

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function SlotLink({
  href,
  className,
  children,
  title,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" title={title}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} title={title}>
      {children}
    </Link>
  );
}

/** Celda homologada: mismo alto, padding y marco para cualquier logo. */
function SponsorLogoTile({
  brand,
  size = "md",
}: {
  brand: SponsorBrand;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-14 w-[148px] px-3"
      : size === "sm"
        ? "h-10 w-[112px] px-2.5"
        : "h-12 w-[132px] px-3";

  return (
    <SlotLink
      href={brand.href}
      title={brand.name}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-mf-border bg-white transition hover:border-mf-gph/35 hover:shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        box,
      )}
    >
      <Image
        src={brand.logoPath}
        alt={brand.name}
        width={140}
        height={56}
        className="h-full w-full object-contain"
      />
    </SlotLink>
  );
}

function SponsorLogoRow({
  brands,
  size = "md",
}: {
  brands: SponsorBrand[];
  size?: "sm" | "md" | "lg";
}) {
  if (brands.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      {brands.map((brand) => (
        <li key={brand.id}>
          <SponsorLogoTile brand={brand} size={size} />
        </li>
      ))}
    </ul>
  );
}

export function SponsorSlot({ placement }: { placement: SponsorPlacement }) {
  const slot = getSponsorSlot(placement);
  const brands = getSponsorBrandsFor(placement);
  const hasBrands = brands.length > 0;

  if (placement === "home_strip") {
    return (
      <aside
        aria-label="Patrocinadores"
        className="border-b border-mf-border bg-[color-mix(in_srgb,var(--mf-brand)_6%,white)]"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
              {slot.eyebrow}
            </span>
            {hasBrands ? (
              <SponsorLogoRow brands={brands} size="sm" />
            ) : (
              <p className="text-sm font-medium text-mf-gph-ink">{slot.availableLabel}</p>
            )}
          </div>
          <SlotLink
            href={hasBrands ? "/fut/patrocinio" : sponsorInquiryHref(placement)}
            className="shrink-0 text-xs font-semibold text-mf-brand hover:underline"
          >
            {hasBrands ? "Ver aliados" : "Anunciar aquí"}
          </SlotLink>
        </div>
      </aside>
    );
  }

  if (placement === "tutor_card") {
    const featured = brands[0] ?? null;
    return (
      <aside
        aria-label="Espacio de patrocinio"
        className="rounded-xl border border-mf-border bg-white px-5 py-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
          {slot.eyebrow}
        </p>
        {featured ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <SponsorLogoTile brand={featured} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-mf-gph-ink">{featured.name}</p>
                <p className="mt-0.5 text-sm leading-6 text-mf-text-secondary">
                  {featured.tagline}
                </p>
              </div>
            </div>
            <SlotLink href={featured.href} className="mf-btn-gph-ghost shrink-0 self-start">
              Conocer más
            </SlotLink>
          </div>
        ) : (
          <>
            <h3 className="mt-2 text-base font-semibold text-mf-gph-ink">
              {slot.availableLabel}
            </h3>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              Visibilidad ante tutores activos: noticias, servicios y ficha del jugador.
            </p>
            <SlotLink
              href={sponsorInquiryHref(placement)}
              className="mf-btn-gph-ghost mt-4 self-start"
            >
              Quiero este espacio
            </SlotLink>
          </>
        )}
      </aside>
    );
  }

  // footer_rail
  return (
    <aside aria-label="Aliados y patrocinio" className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            {slot.eyebrow}
          </p>
          <SponsorLogoRow brands={brands} size="md" />
        </div>
        <SlotLink
          href={sponsorInquiryHref(placement)}
          className="inline-flex h-12 shrink-0 items-center rounded-lg border border-dashed border-mf-border bg-white px-3 text-xs font-semibold text-mf-text-secondary transition hover:border-mf-brand/40 hover:text-mf-brand"
        >
          + {slot.availableLabel}
        </SlotLink>
      </div>
    </aside>
  );
}
