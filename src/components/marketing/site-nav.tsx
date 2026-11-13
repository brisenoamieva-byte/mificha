"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MARKETING_NAV, MARKETING_SECONDARY_LINKS } from "@/lib/marketing-nav";
import { cn } from "@/lib/utils";

function NavLinks({
  links,
  onNavigate,
}: {
  links: typeof MARKETING_NAV[number]["links"];
  onNavigate?: () => void;
}) {
  return (
    <>
      {links.map((link) => {
        const external = link.href.startsWith("http");
        const className = "block px-4 py-3 transition hover:bg-mf-brand-soft";
        const body = (
          <>
            <p className="text-sm font-semibold text-mf-text">
              {link.label}
              {link.soon ? (
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  Pronto
                </span>
              ) : null}
            </p>
            {link.description ? (
              <p className="mt-0.5 text-xs leading-5 text-mf-text-muted">{link.description}</p>
            ) : null}
          </>
        );
        return external ? (
          <a
            key={link.href + link.label}
            href={link.href}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
          >
            {body}
          </a>
        ) : (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={className}
            onClick={onNavigate}
          >
            {body}
          </Link>
        );
      })}
    </>
  );
}

export function SiteNavDesktop() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-0.5">
      {MARKETING_NAV.map((section) => (
        <div
          key={section.id}
          className="relative"
          onMouseEnter={() => setOpenSection(section.id)}
          onMouseLeave={() => setOpenSection(null)}
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-medium text-mf-text-secondary transition hover:bg-black/[0.04] hover:text-mf-text"
          >
            {section.label}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {openSection === section.id ? (
            <div className="absolute left-0 top-full z-50 w-72 pt-2">
              <div className="overflow-hidden rounded-xl border border-mf-border bg-mf-surface py-2 shadow-lg">
                <NavLinks links={section.links} />
              </div>
            </div>
          ) : null}
        </div>
      ))}

      <div
        className="relative"
        onMouseEnter={() => setOpenSection("mas")}
        onMouseLeave={() => setOpenSection(null)}
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-medium text-mf-text-secondary transition hover:bg-black/[0.04] hover:text-mf-text"
        >
          Más
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
        {openSection === "mas" ? (
          <div className="absolute right-0 top-full z-50 w-72 pt-2">
            <div className="overflow-hidden rounded-xl border border-mf-border bg-mf-surface py-2 shadow-lg">
              <NavLinks links={MARKETING_SECONDARY_LINKS} />
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function SiteNavMobile({
  actionHref = "/fut/entrar",
  actionLabel = "Entrar",
}: {
  actionHref?: string;
  actionLabel?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const mobilePanel =
    mobileOpen && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] bg-black/25 lg:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <div
              id="mobile-nav-panel"
              className="mf-mobile-nav-panel mf-safe-bottom fixed inset-x-0 bottom-0 z-[101] max-h-[85dvh] overflow-y-auto overscroll-contain border-t border-mf-border bg-mf-surface px-4 py-4 shadow-xl lg:hidden"
            >
              {MARKETING_NAV.map((section) => (
                <div key={section.id} className="border-b border-mf-border-subtle py-3 last:border-0">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-mf-brand">
                    {section.label}
                  </p>
                  <div className="mt-2 space-y-1">
                    {section.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="block rounded-lg px-2 py-2.5 text-sm font-medium text-mf-text hover:bg-mf-brand-soft"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                        {link.soon ? (
                          <span className="ml-2 text-[10px] uppercase text-mf-text-muted">
                            Pronto
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-b border-mf-border-subtle py-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-mf-brand">
                  Más
                </p>
                <div className="mt-2 space-y-1">
                  {MARKETING_SECONDARY_LINKS.map((link) => {
                    const external = link.href.startsWith("http");
                    const className =
                      "block rounded-lg px-2 py-2.5 text-sm font-medium text-mf-text hover:bg-mf-brand-soft";
                    return external ? (
                      <a
                        key={link.href + link.label}
                        href={link.href}
                        className={className}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className={className}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-mf-border-subtle pt-4 sm:hidden">
                <Link
                  href={actionHref}
                  className="mf-btn-gph w-full justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {actionLabel}
                </Link>
                <Link
                  href="/fut/login"
                  className="block rounded-lg px-2 py-2.5 text-center text-sm font-medium text-mf-text-secondary hover:bg-mf-brand-soft"
                  onClick={() => setMobileOpen(false)}
                >
                  Academia · iniciar sesión
                </Link>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mf-text-secondary transition hover:bg-black/[0.04] lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-panel"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {mobilePanel}
    </>
  );
}

/** @deprecated Use SiteNavDesktop + SiteNavMobile in the header layout. */
export function SiteNav() {
  return (
    <>
      <div className="hidden lg:block">
        <SiteNavDesktop />
      </div>
      <SiteNavMobile />
    </>
  );
}
