"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Printer } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  buildOrganizerAcademyBlastText,
  buildOrganizerOnePagerPlainText,
  ORGANIZER_ONE_PAGER,
} from "@/lib/organizer-one-pager";
import { toast } from "@/components/ui/toast";

export function OrganizerOnePagerView() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [copiedBlast, setCopiedBlast] = useState(false);

  const personalization = useMemo(
    () => ({
      tournamentName:
        searchParams.get("torneo") ?? searchParams.get("tournament") ?? "",
      contactName: searchParams.get("contacto") ?? searchParams.get("contact") ?? "",
      seasonLabel: searchParams.get("temporada") ?? searchParams.get("season") ?? "",
    }),
    [searchParams],
  );

  const plainText = buildOrganizerOnePagerPlainText(personalization);
  const blastText = buildOrganizerAcademyBlastText({
    tournamentName: personalization.tournamentName || "Interescolar MiFicha",
  });

  async function copyText(text: string, which: "pitch" | "blast") {
    await navigator.clipboard.writeText(text);
    if (which === "pitch") setCopied(true);
    else setCopiedBlast(true);
    toast.success("Texto copiado.");
    setTimeout(() => {
      setCopied(false);
      setCopiedBlast(false);
    }, 2000);
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
              onClick={() => copyText(plainText, "pitch")}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copiado" : "Pitch organizador"}
            </button>
            <button
              type="button"
              onClick={() => copyText(blastText, "blast")}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/10"
            >
              <Copy className="h-4 w-4" />
              {copiedBlast ? "Copiado" : "Blast academias"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628]"
            >
              <Printer className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-xs text-white/45">
          <code className="text-white/60">
            ?torneo=Liga+Escolar+Qro&contacto=Juan&temporada=2025-2026
          </code>
        </p>
      </div>

      <article className="director-one-pager mx-auto max-w-3xl bg-white px-8 py-10 text-slate-900 sm:px-12 sm:py-12 print:max-w-none">
        <header className="border-b border-slate-200 pb-6">
          <BrandLogo size="md" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4F8C]">
            {ORGANIZER_ONE_PAGER.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0a1628]">
            {ORGANIZER_ONE_PAGER.title}
          </h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            {ORGANIZER_ONE_PAGER.tagline}
          </p>
          {personalization.tournamentName ? (
            <p className="mt-4 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
              {personalization.tournamentName}
            </p>
          ) : null}
        </header>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {ORGANIZER_ONE_PAGER.problemTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {ORGANIZER_ONE_PAGER.problems.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B4F8C]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-slate-50 px-5 py-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {ORGANIZER_ONE_PAGER.solutionTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {ORGANIZER_ONE_PAGER.solution}
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900">
            {ORGANIZER_ONE_PAGER.askTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {ORGANIZER_ONE_PAGER.askPoints.map((item) => (
              <li key={item} className="text-sm leading-6 text-amber-950/90">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1B4F8C]">
            {ORGANIZER_ONE_PAGER.governanceTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {ORGANIZER_ONE_PAGER.governancePoints.map((item) => (
              <li key={item} className="text-sm leading-6 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{ORGANIZER_ONE_PAGER.cta}</p>
          <p className="mt-2">
            {ORGANIZER_ONE_PAGER.contact.name} · {ORGANIZER_ONE_PAGER.contact.email} ·{" "}
            {ORGANIZER_ONE_PAGER.contact.web}
          </p>
        </footer>
      </article>
    </>
  );
}
