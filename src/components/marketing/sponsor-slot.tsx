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
      <a
        href={href}
        className={className}
        rel="noopener noreferrer"
        target="_blank"
        title={title}
      >
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
      ? "h-16 w-[min(42vw,160px)] sm:w-[160px] px-3"
      : size === "sm"
        ? "h-12 w-[min(40vw,128px)] sm:w-[128px] px-2.5"
        : "h-14 w-[min(42vw,148px)] sm:w-[148px] px-3";

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
        width={160}
        height={64}
        className="h-full w-full object-contain"
      />
    </SlotLink>
  );
}

function SponsorLogoRow({
  brands,
  size = "md",
  className,
}: {
  brands: SponsorBrand[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (brands.length === 0) return null;
  return (
    <ul
      className={cn(
        "flex w-full max-w-xl flex-wrap items-center justify-center gap-2.5 sm:max-w-none sm:justify-start sm:gap-3",
        className,
      )}
    >
      {brands.map((brand) => (
        <li key={brand.id} className="shrink-0">
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-3.5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5 sm:text-left">
          <div className="flex w-full min-w-0 flex-col items-center gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-2">
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
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <SponsorLogoTile brand={featured} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-mf-gph-ink">{featured.name}</p>
                <p className="mt-0.5 text-sm leading-6 text-mf-text-secondary">
                  {featured.tagline}
                </p>
              </div>
            </div>
            <SlotLink
              href={featured.href}
              className="mf-btn-gph-ghost w-full shrink-0 self-stretch sm:w-auto sm:self-start"
            >
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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
        <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-x-4">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
            {slot.eyebrow}
          </p>
          <SponsorLogoRow brands={brands} size="md" />
        </div>
        <SlotLink
          href={sponsorInquiryHref(placement)}
          className="inline-flex h-12 w-full max-w-xs shrink-0 items-center justify-center rounded-lg border border-dashed border-mf-border bg-white px-3 text-xs font-semibold text-mf-text-secondary transition hover:border-mf-brand/40 hover:text-mf-brand sm:w-auto sm:max-w-none"
        >
          + {slot.availableLabel}
        </SlotLink>
      </div>
    </aside>
  );
}
