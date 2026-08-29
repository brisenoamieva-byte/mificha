import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AUDIENCE_VALUE_PROPS } from "@/lib/audience-value-props";
import { cn } from "@/lib/utils";

/** Perfiles principales en home — sin listas largas para reducir scroll en móvil. */
const HOME_AUDIENCE_IDS = ["academia", "padres", "evaluaciones", "organizador"] as const;

export function HomeAudienceSection() {
  const items = AUDIENCE_VALUE_PROPS.filter((item) =>
    HOME_AUDIENCE_IDS.includes(item.id as (typeof HOME_AUDIENCE_IDS)[number]),
  );

  return (
    <section id="accesos" className="border-t border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Accesos</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            Elige tu perfil
          </h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="mf-card group flex items-start gap-4 p-4 transition hover:border-mf-brand/25 sm:p-5"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.tone === "brand"
                    ? "bg-mf-brand-soft text-mf-brand"
                    : "bg-mf-accent-soft text-mf-accent-dark",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-mf-text">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.headline}</p>
                <span
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 text-sm font-semibold",
                    item.tone === "brand"
                      ? "text-mf-brand group-hover:text-mf-brand-dark"
                      : "text-mf-accent-dark group-hover:text-[#047857]",
                  )}
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
