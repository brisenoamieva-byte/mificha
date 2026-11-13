import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import {
  SPONSOR_SALES,
  SPONSOR_WHATSAPP_DISPLAY,
  sponsorWhatsAppInquiryHref,
} from "@/lib/sponsor-packages";
import { listActiveSponsorBrands } from "@/lib/sponsor-slots";

export const metadata: Metadata = {
  title: "Patrocinio | MiFicha",
  description:
    "Solicita información de patrocinio en MiFicha por WhatsApp. Espacios de marca ante familias de futbol.",
};

export default function PatrocinioPage() {
  const whatsapp = sponsorWhatsAppInquiryHref();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              {SPONSOR_SALES.eyebrow}
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-mf-gph-ink sm:text-4xl">
              {SPONSOR_SALES.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-mf-text-secondary sm:text-base">
              {SPONSOR_SALES.summary}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mf-btn-gph"
              >
                Pedir info por WhatsApp
              </a>
              <p className="text-sm text-mf-text-secondary">
                {SPONSOR_WHATSAPP_DISPLAY}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-mf-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <h2 className="text-xl font-semibold text-mf-gph-ink">A quién llegas</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {SPONSOR_SALES.audiencePoints.map((point) => (
                <li
                  key={point}
                  className="rounded-xl border border-mf-border bg-white px-4 py-4 text-sm leading-6 text-mf-text-secondary"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="aliados" className="border-b border-mf-border bg-mf-canvas">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <h2 className="text-xl font-semibold text-mf-gph-ink">Patrocinadores activos</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
              Marcas ya presentes en la plataforma.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {listActiveSponsorBrands().map((brand) => (
                <li
                  key={brand.id}
                  className="flex items-center gap-4 rounded-xl border border-mf-border bg-white px-4 py-4"
                >
                  <div className="flex h-14 w-[148px] shrink-0 items-center justify-center rounded-lg border border-mf-border bg-white px-3">
                    <Image
                      src={brand.logoPath}
                      alt={brand.name}
                      width={140}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-mf-gph-ink">{brand.name}</p>
                    <p className="mt-0.5 text-sm text-mf-text-secondary">{brand.tagline}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <h2 className="text-xl font-semibold text-mf-gph-ink">Contacto</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-mf-text-secondary">
              {SPONSOR_SALES.governance.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border border-mf-border bg-mf-canvas px-5 py-5">
              <p className="text-sm font-semibold text-mf-gph-ink">MiFicha</p>
              <p className="mt-1 text-sm text-mf-text-secondary">
                Solicitudes de patrocinio por WhatsApp
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-mf-brand hover:underline"
              >
                WhatsApp {SPONSOR_WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
