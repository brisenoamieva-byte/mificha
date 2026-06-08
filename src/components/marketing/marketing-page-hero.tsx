import type { ReactNode } from "react";
import type { MarketingImageMeta } from "@/lib/marketing-assets";
import { MarketingHeroVisual } from "@/components/marketing/marketing-hero-visual";
import { cn } from "@/lib/utils";

interface MarketingStat {
  value: string;
  label: string;
  /** Resalta con verde acento (progreso / Passport) */
  accent?: boolean;
}

interface MarketingPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: MarketingStat[];
  aside?: ReactNode;
  photo?: MarketingImageMeta;
  photoPriority?: boolean;
  className?: string;
}

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  aside,
  photo,
  photoPriority = false,
  className,
}: MarketingPageHeroProps) {
  const hasVisual = Boolean(photo);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-mf-border bg-mf-surface",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(27,79,140,0.1),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_10%,rgba(52,211,153,0.07),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18",
          hasVisual &&
            "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:py-20",
        )}
      >
        <div className={hasVisual ? "max-w-xl" : "max-w-3xl"}>
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
                  <dt
                    className={cn(
                      "text-lg font-semibold tabular-nums tracking-tight",
                      item.accent ? "mf-stat-accent" : "text-mf-text",
                    )}
                  >
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
        {hasVisual ? (
          <MarketingHeroVisual
            meta={photo!}
            aside={aside}
            priority={photoPriority}
          />
        ) : aside ? (
          <div className="min-w-0">{aside}</div>
        ) : null}
      </div>
    </section>
  );
}
