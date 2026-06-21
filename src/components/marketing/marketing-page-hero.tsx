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
  description: ReactNode;
  actions?: ReactNode;
  stats?: MarketingStat[];
  aside?: ReactNode;
  asideAlign?: "center" | "start";
  asideClassName?: string;
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
  asideAlign = "center",
  asideClassName,
  photo,
  photoPriority = false,
  className,
}: MarketingPageHeroProps) {
  const hasAside = Boolean(aside);
  const hasPhoto = Boolean(photo);
  const twoColumn = hasPhoto || hasAside;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-mf-border bg-mf-surface",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(27,79,140,0.08),transparent)]"
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20",
          twoColumn &&
            "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12",
          twoColumn &&
            (asideAlign === "start" ? "lg:items-start" : "lg:items-center"),
        )}
      >
        <div className={cn(twoColumn && "self-start", twoColumn ? "max-w-xl" : "max-w-3xl")}>
          <p className="mf-marketing-eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-mf-text sm:text-[2.5rem] lg:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-mf-text-secondary sm:mt-5 sm:text-[1.0625rem] sm:leading-8">
            {description}
          </p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">{actions}</div> : null}
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
        {hasPhoto ? (
          <MarketingHeroVisual
            meta={photo!}
            aside={aside}
            priority={photoPriority}
          />
        ) : hasAside ? (
          <div className={cn("min-w-0 lg:justify-self-end", asideClassName)}>{aside}</div>
        ) : null}
      </div>
    </section>
  );
}
