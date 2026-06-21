import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AUDIENCE_VALUE_PROPS } from "@/lib/audience-value-props";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { cn } from "@/lib/utils";

export function HomeAudienceSection() {
  return (
    <section id="accesos" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
      <div className="max-w-2xl">
        <p className="mf-marketing-eyebrow">¿Eres…?</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
          ¿Por qué te interesa <BrandWordmark />?
        </h2>
        <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
          Cada quien gana algo distinto. El acta oficial del torneo es el punto de
          partida para todos.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {AUDIENCE_VALUE_PROPS.map((item) => (
          <article
            key={item.id}
            className="mf-card flex flex-col p-6 transition hover:border-mf-brand/25"
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  item.tone === "brand"
                    ? "bg-mf-brand-soft text-mf-brand"
                    : "bg-mf-accent-soft text-mf-accent-dark",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-mf-text">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-mf-text">
                  {item.headline}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-mf-border-subtle pt-4">
              {item.reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex gap-2 text-sm leading-6 text-mf-text-secondary"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mf-brand/60" />
                  {reason}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold",
                  item.tone === "brand"
                    ? "text-mf-brand hover:text-mf-brand-dark"
                    : "text-mf-accent-dark hover:text-[#047857]",
                )}
              >
                {item.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {item.secondaryHref ? (
                <Link
                  href={item.secondaryHref}
                  className="text-sm font-medium text-mf-text-muted hover:text-mf-text"
                >
                  {item.secondaryLabel}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
