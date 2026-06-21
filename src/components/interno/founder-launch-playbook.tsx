"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Copy,
  ExternalLink,
  FileText,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  buildFounderOutreachMessage,
  FOUNDER_CONVERSION_CRITERIA,
  FOUNDER_DEMO_PRECHECK,
  FOUNDER_GOVERNANCE_SUMMARY,
  FOUNDER_LIVE_DEMO_SCRIPT,
  FOUNDER_POST_MATCH_CHECKLIST,
  FOUNDER_WEEK_PLAN,
} from "@/lib/founder-playbook";
import { toast } from "@/components/ui/toast";

const defaultOutreach = buildFounderOutreachMessage({
  contactName: "[nombre del director]",
  matchDate: "[fecha del partido]",
  academyName: "[nombre de la academia]",
});

const QUICK_LINKS: Array<{ href: string; label: string; primary?: boolean }> = [
  { href: "/interno/pitch", label: "Presentación", primary: true },
  { href: "/interno/demo-one-pager", label: "One-pager" },
  { href: "/interno/organizadores", label: "Organizador" },
  { href: "/interno/jornadas", label: "Jornadas / acta" },
  { href: "/dashboard", label: "Dashboard" },
];

export function FounderLaunchPlaybook() {
  const [copied, setCopied] = useState(false);

  async function copyOutreach() {
    await navigator.clipboard.writeText(defaultOutreach);
    setCopied(true);
    toast.success("Mensaje copiado. Personaliza nombre, academia y fecha.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <header className="border-b border-white/10 px-6 py-5 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Lanzamiento · Querétaro
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Playbook de venta y demo
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Presentación 5 min + demo en vivo 15 min. Acta oficial → ficha del
            jugador → aviso al padre.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.primary
                    ? "inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1628] hover:bg-white/95"
                    : "inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                }
              >
                {link.primary ? <Sparkles className="h-3.5 w-3.5" /> : null}
                {link.label}
                {link.primary ? null : <ArrowRight className="h-3 w-3 opacity-60" />}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8 sm:px-10">
        <section className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.08] p-5">
          <h2 className="text-base font-semibold">Guión · demo 15 min</h2>
          <ol className="mt-4 space-y-3">
            {FOUNDER_LIVE_DEMO_SCRIPT.map((step) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                      {step.minute}
                    </p>
                    <p className="mt-0.5 font-semibold text-white">{step.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-white/70">{step.action}</p>
                  </div>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
                    >
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold">Quién hace qué</h2>
          <ul className="mt-3 space-y-2">
            {FOUNDER_GOVERNANCE_SUMMARY.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-white/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/interno/gobernanza"
            className="mt-4 inline-flex text-sm font-medium text-violet-300 hover:text-violet-200"
          >
            Detalle completo →
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold">Antes de la demo</h2>
          <ul className="mt-3 space-y-2">
            {FOUNDER_DEMO_PRECHECK.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-white/75">
                <span className="text-white/35">□</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Mensaje para prospectar</h2>
              <p className="mt-1 text-sm text-white/55">
                Copia, personaliza y envía por WhatsApp o email.
              </p>
            </div>
            <button
              type="button"
              onClick={copyOutreach}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black/30 p-4 text-sm leading-6 text-white/80 whitespace-pre-wrap">
            {defaultOutreach}
          </pre>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
            <h2 className="text-base font-semibold text-amber-100">
              Academia convertida
            </h2>
            <ul className="mt-3 space-y-2">
              {FOUNDER_CONVERSION_CRITERIA.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-amber-50/90">
                  <span className="text-amber-300/80">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-base font-semibold">Plan de la semana</h2>
            <ol className="mt-3 space-y-3">
              {FOUNDER_WEEK_PLAN.map((item) => (
                <li key={item.day} className="text-sm">
                  <span className="font-semibold text-amber-300">{item.day}</span>
                  <span className="text-white/75"> · {item.task}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold">Después del primer partido real</h2>
          <ol className="mt-3 space-y-2">
            {FOUNDER_POST_MATCH_CHECKLIST.map((item, index) => (
              <li key={item} className="flex gap-2 text-sm text-white/75">
                <span className="w-4 shrink-0 tabular-nums text-white/40">
                  {index + 1}.
                </span>
                {item}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/interno/jornadas"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              Publicar acta
            </Link>
            <Link
              href="/dashboard/plantel/tutores"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
              Tutores
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
