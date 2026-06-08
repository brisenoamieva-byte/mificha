"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  buildDirectorOnePagerPlainText,
  DIRECTOR_ONE_PAGER,
} from "@/lib/director-one-pager";
import { toast } from "@/components/ui/toast";

export function DemoOnePagerView() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const personalization = useMemo(
    () => ({
      academyName: searchParams.get("academia") ?? searchParams.get("academy") ?? "",
      contactName: searchParams.get("contacto") ?? searchParams.get("contact") ?? "",
      matchDate: searchParams.get("partido") ?? searchParams.get("match") ?? "",
    }),
    [searchParams],
  );

  const plainText = buildDirectorOnePagerPlainText(personalization);

  async function copyWhatsAppText() {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success("Texto copiado — pégalo en WhatsApp o email.");
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

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
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
            >
              <Printer className="h-4 w-4" />
              Guardar PDF
            </button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-white/45">
          Personaliza con{" "}
          <code className="text-white/60">
            ?academia=Colegio+X&contacto=Director&partido=2026-03-15
          </code>
        </p>
      </div>

      <article className="director-one-pager mx-auto max-w-3xl bg-white px-8 py-10 text-slate-900 sm:px-12 sm:py-12 print:max-w-none print:px-10 print:py-8">
        <header className="border-b border-slate-200 pb-6">
          <BrandLogo size="md" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4F8C]">
            {DIRECTOR_ONE_PAGER.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0a1628]">
            {DIRECTOR_ONE_PAGER.title}
          </h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            {DIRECTOR_ONE_PAGER.tagline}
          </p>
          {personalization.academyName ? (
            <p className="mt-4 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              Preparado para {personalization.academyName}
            </p>
          ) : null}
        </header>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {DIRECTOR_ONE_PAGER.problemTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {DIRECTOR_ONE_PAGER.problems.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B4F8C]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-slate-50 px-5 py-5 print:bg-slate-50">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {DIRECTOR_ONE_PAGER.solutionTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {DIRECTOR_ONE_PAGER.solution}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {DIRECTOR_ONE_PAGER.governanceTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {DIRECTOR_ONE_PAGER.governancePoints.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {DIRECTOR_ONE_PAGER.demoTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{DIRECTOR_ONE_PAGER.demoIntro}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
            {DIRECTOR_ONE_PAGER.demoSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-slate-200 px-4 py-4 print:break-inside-avoid"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1B4F8C] text-xs font-bold text-white">
                  {step.step}
                </span>
                <p className="mt-2 font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
              {DIRECTOR_ONE_PAGER.parentTitle}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {DIRECTOR_ONE_PAGER.parentPoints.map((item) => (
                <li key={item} className="text-xs leading-5 text-slate-700">
                  · {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
              {DIRECTOR_ONE_PAGER.founderTitle}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {DIRECTOR_ONE_PAGER.founderBenefits.map((item) => (
                <li key={item} className="text-xs leading-5 text-slate-700">
                  · {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 print:break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
            {DIRECTOR_ONE_PAGER.pilotTitle}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {DIRECTOR_ONE_PAGER.pilotGoals.map((item) => (
              <li key={item} className="text-sm font-medium text-emerald-900">
                ✓ {item}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 print:mt-8">
          <p className="text-xl font-bold text-[#0a1628]">{DIRECTOR_ONE_PAGER.cta}</p>
          {personalization.matchDate ? (
            <p className="mt-2 text-sm text-slate-600">
              Ideal antes del partido del{" "}
              <strong>{personalization.matchDate}</strong>.
            </p>
          ) : null}
          <p className="mt-4 text-sm text-slate-700">
            {DIRECTOR_ONE_PAGER.contact.name} ·{" "}
            <span className="font-semibold text-[#1B4F8C]">
              {DIRECTOR_ONE_PAGER.contact.web}
            </span>{" "}
            · {DIRECTOR_ONE_PAGER.contact.email}
          </p>
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
          .director-one-pager {
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
