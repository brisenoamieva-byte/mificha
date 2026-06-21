import { Ban, ShieldCheck } from "lucide-react";
import { ORGANIZER_ONE_PAGER } from "@/lib/organizer-one-pager";

export function OrganizerTrustSection() {
  return (
    <section className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mf-brand-soft text-mf-brand">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-mf-text">
              {ORGANIZER_ONE_PAGER.pilotTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {ORGANIZER_ONE_PAGER.pilotPoints.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm leading-7 text-mf-text-secondary"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mf-brand" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mf-surface text-mf-text-muted">
              <Ban className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-mf-text">
              {ORGANIZER_ONE_PAGER.boundariesTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {ORGANIZER_ONE_PAGER.boundariesPoints.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm leading-7 text-mf-text-secondary"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mf-text-muted" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
