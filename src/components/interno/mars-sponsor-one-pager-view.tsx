"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  buildMarsSponsorPlainText,
  MARS_SPONSOR_BRAND,
  MARS_SPONSOR_ONE_PAGER,
} from "@/lib/mars-sponsor-one-pager";
import { toast } from "@/components/ui/toast";

function CoBrandLockup() {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
      <BrandLogo size="lg" />
      <span className="text-2xl font-light text-slate-300" aria-hidden>
        ×
      </span>
      <div className="rounded-xl bg-black px-4 py-3">
        <Image
          src={MARS_SPONSOR_BRAND.logoPath}
          alt="Mars"
          width={120}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </div>
    </div>
  );
}

export function MarsSponsorOnePagerView() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const contactName = useMemo(
    () => searchParams.get("contacto") ?? searchParams.get("contact") ?? "",
    [searchParams],
  );

  const plainText = buildMarsSponsorPlainText({ contactName });

  async function copyWhatsAppText() {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success("Texto copiado — pégalo en WhatsApp o email.");
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  const mars = MARS_SPONSOR_BRAND;
  const content = MARS_SPONSOR_ONE_PAGER;

  return (
    <>
      <div className="no-print sticky top-0 z-20 border-b border-white/10 bg-[#0a1628] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/interno/lanzamiento"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Playbook
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyWhatsAppText}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copiado" : "Copiar para WhatsApp"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: mars.accent }}
            >
              <Printer className="h-4 w-4" />
              Guardar PDF
            </button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-white/45">
          Personaliza con{" "}
          <code className="text-white/60">?contacto=Nombre+en+Mars</code> · Confidencial
        </p>
      </div>

      <article className="mars-sponsor-one-pager mx-auto max-w-3xl bg-white px-8 py-10 text-slate-900 sm:px-12 sm:py-12 print:max-w-none print:px-10 print:py-8">
        <header className="border-b border-slate-200 pb-6">
          <CoBrandLockup />
          <p
            className="mt-5 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: mars.accent }}
          >
            {content.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0a1628] sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">{content.region}</p>
          <p className="mt-4 text-lg leading-8 text-slate-600">{content.tagline}</p>
          {contactName ? (
            <p
              className="mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{ backgroundColor: mars.accentSoft, color: mars.accent }}
            >
              Para {contactName} · Mars
            </p>
          ) : null}
        </header>

        <section className="mt-8">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: mars.accent }}
          >
            {content.opportunityTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{content.opportunity}</p>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: mars.accent }}
            >
              {content.audienceTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              {content.audiencePoints.map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-5 text-slate-700">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: mars.accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: mars.accent }}
            >
              {content.fitTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              {content.fitPoints.map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-5 text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: mars.accent }}
          >
            {content.activationsTitle}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
            {content.activations.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 px-4 py-4 print:break-inside-avoid"
              >
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: mars.accent }}
                >
                  {item.tier}
                </span>
                <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-8 rounded-2xl px-5 py-5 print:break-inside-avoid"
          style={{ backgroundColor: mars.accentSoft }}
        >
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: mars.accent }}
          >
            {content.metricsTitle}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {content.metrics.map((item) => (
              <li key={item} className="text-sm font-medium text-slate-800">
                ✓ {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
              {content.pilotTitle}
            </h2>
            <p className="mt-2 text-xs leading-5 text-emerald-900/80">{content.pilotIntro}</p>
            <ul className="mt-3 space-y-1">
              {content.pilotGoals.map((item) => (
                <li key={item} className="text-xs font-medium text-emerald-900">
                  · {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: mars.accent }}
            >
              {content.governanceTitle}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {content.governancePoints.map((item) => (
                <li key={item} className="text-xs leading-5 text-slate-700">
                  · {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: mars.accent }}
          >
            {content.askTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {content.askPoints.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: mars.accent }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: mars.accent }}
          >
            {content.timelineTitle}
          </h2>
          <div className="mt-4 space-y-2">
            {content.timeline.map((item) => (
              <div
                key={item.phase}
                className="flex gap-4 rounded-lg border border-slate-100 px-4 py-3"
              >
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{ color: mars.accent }}
                >
                  {item.phase}
                </span>
                <span className="text-sm text-slate-700">{item.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 print:mt-8">
          <div className="flex flex-wrap items-center gap-4">
            <CoBrandLockup />
          </div>
          <p className="mt-6 text-xl font-bold text-[#0a1628]">{content.cta}</p>
          <p className="mt-4 text-sm text-slate-700">
            {content.contact.name} · {content.contact.role} ·{" "}
            <span className="font-semibold" style={{ color: mars.accent }}>
              {content.contact.web}
            </span>{" "}
            · {content.contact.email}
          </p>
          <p className="mt-4 text-[10px] leading-4 text-slate-400">{content.disclaimer}</p>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .mars-sponsor-one-pager {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
}
