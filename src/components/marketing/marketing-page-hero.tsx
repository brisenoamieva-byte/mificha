import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketingStat {
  value: string;
  label: string;
}

interface MarketingPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: MarketingStat[];
  aside?: ReactNode;
  className?: string;
}

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  aside,
  className,
}: MarketingPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-mf-border bg-mf-surface",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(27,79,140,0.12),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18",
          aside && "grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20",
        )}
      >
        <div className={aside ? "max-w-xl" : "max-w-3xl"}>
          <p className="mf-marketing-eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-mf-text sm:text-[2.5rem] lg:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-mf-text-secondary sm:text-[1.0625rem]">
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          {stats && stats.length > 0 ? (
            <dl
              className={cn(
                "grid gap-4 border-t border-mf-border-subtle pt-8",
                stats.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
                actions ? "mt-10" : "mt-8",
              )}
            >
              {stats.map((item) => (
                <div key={item.label}>
                  <dt className="text-lg font-semibold tabular-nums tracking-tight text-mf-text">
                    {item.value}
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-mf-text-muted">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
