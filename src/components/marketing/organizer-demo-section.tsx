import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ORGANIZER_ONE_PAGER } from "@/lib/organizer-one-pager";

export function OrganizerDemoSection() {
  return (
    <section id="como-funciona-organizadores" className="scroll-mt-24 border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            {ORGANIZER_ONE_PAGER.demoTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary sm:text-base">
            {ORGANIZER_ONE_PAGER.demoSubtitle}
          </p>

          <ol className="mt-8 space-y-3">
            {ORGANIZER_ONE_PAGER.demoSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-7 text-mf-text-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Link href={ORGANIZER_ONE_PAGER.demoExploreHref} className="mf-btn-primary">
              Ver red en Explorar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
