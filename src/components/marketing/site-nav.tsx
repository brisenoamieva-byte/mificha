"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { MARKETING_NAV } from "@/lib/marketing-nav";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {MARKETING_NAV.map((section) => (
          <div
            key={section.id}
            className="relative"
            onMouseEnter={() => setOpenSection(section.id)}
            onMouseLeave={() => setOpenSection(null)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-mf-text-secondary transition hover:bg-black/[0.04] hover:text-mf-text"
            >
              {section.label}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {openSection === section.id ? (
              <div className="absolute left-0 top-full z-50 w-72 pt-2">
                <div className="overflow-hidden rounded-xl border border-mf-border bg-mf-surface py-2 shadow-lg">
                  {section.links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="block px-4 py-3 transition hover:bg-mf-brand-soft"
                    >
                      <p className="text-sm font-semibold text-mf-text">{link.label}</p>
                      {link.description ? (
                        <p className="mt-0.5 text-xs leading-5 text-mf-text-muted">
                          {link.description}
                        </p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}

        <Link
          href="/aviso-privacidad"
          className="rounded-full px-3 py-2 text-sm font-medium text-mf-text-secondary transition hover:bg-black/[0.04] hover:text-mf-text"
        >
          Privacidad
        </Link>
      </nav>

      <button
        type="button"
        className="rounded-md p-2 text-mf-text-secondary hover:bg-black/[0.04] lg:hidden"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen ? (
        <div className="absolute inset-x-0 top-14 z-50 border-b border-mf-border bg-mf-surface px-4 py-4 shadow-lg lg:hidden">
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
                    className="block rounded-lg px-2 py-2 text-sm font-medium text-mf-text hover:bg-mf-brand-soft"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            href="/aviso-privacidad"
            className={cn(
              "mt-2 block rounded-lg px-2 py-2 text-sm font-medium text-mf-text-secondary",
              "hover:bg-mf-brand-soft",
            )}
            onClick={() => setMobileOpen(false)}
          >
            Aviso de privacidad
          </Link>
        </div>
      ) : null}
    </>
  );
}
