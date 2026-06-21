import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACADEMY_ACCESS, ORGANIZER_PRICING } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface OrganizerPricingSectionProps {
  mailtoHref: string;
}

export function OrganizerPricingSection({ mailtoHref }: OrganizerPricingSectionProps) {
  return (
    <section id="precios" className="border-y border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Modelo</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            {ORGANIZER_PRICING.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary sm:text-base">
            {ORGANIZER_PRICING.subtitle}
          </p>
          <p className="mt-2 text-sm font-medium text-mf-brand">{ACADEMY_ACCESS.summary}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {ORGANIZER_PRICING.plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border p-5 sm:p-6",
                plan.highlight
                  ? "border-mf-brand bg-mf-brand-soft/40 shadow-sm"
                  : "border-mf-border bg-white",
              )}
            >
              {plan.badge ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-mf-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {plan.badge}
                </span>
              ) : null}
              <p className="text-sm font-semibold text-mf-text">{plan.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-mf-brand">
                {plan.priceLabel}
              </p>
              <p className="mt-1 text-xs font-medium text-mf-text-muted">{plan.period}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-mf-text-secondary">
                {plan.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs text-mf-text-muted">{ORGANIZER_PRICING.footnote}</p>

        <p className="mt-3 text-sm text-mf-text-secondary">
          <span className="font-semibold text-mf-text">{ORGANIZER_PRICING.costExample.label}:</span>{" "}
          {ORGANIZER_PRICING.costExample.summary}{" "}
          <span className="text-mf-text-muted">{ORGANIZER_PRICING.costExample.note}</span>
        </p>

        <div className="mt-8">
          <a href={mailtoHref} className="mf-btn-primary">
            Cotizar mi torneo
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
