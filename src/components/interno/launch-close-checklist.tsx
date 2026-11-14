"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { LAUNCH_CLOSE_STEPS } from "@/lib/launch-close-checklist";
import { toast } from "@/components/ui/toast";

export function LaunchCloseChecklist() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(id: string, value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success(`${label} listo.`);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] p-5">
      <h2 className="text-base font-semibold">Cierre técnico · antes de la ola</h2>
      <p className="mt-1 text-sm leading-6 text-white/65">
        Academia↔tutor ya está en código. Falta configurar Supabase (2 clics + pegar) y
        un smoke test.
      </p>
      <ol className="mt-4 space-y-3">
        {LAUNCH_CLOSE_STEPS.map((step, index) => (
          <li
            key={step.id}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Paso {index + 1}
                </p>
                <p className="mt-0.5 font-semibold text-white">{step.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-white/70">{step.detail}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {step.copyValue && step.copyLabel ? (
                  <button
                    type="button"
                    onClick={() => void copy(step.id, step.copyValue, step.copyLabel)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
                  >
                    {copiedId === step.id ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedId === step.id ? "Copiado" : step.copyLabel}
                  </button>
                ) : null}
                <Link
                  href={step.href}
                  target={step.href.startsWith("http") ? "_blank" : undefined}
                  rel={step.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1628] hover:bg-white/95"
                >
                  Abrir
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
