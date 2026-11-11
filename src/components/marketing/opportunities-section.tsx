import Link from "next/link";
import {
  getOpenOpportunities,
  OPPORTUNITY_ROADMAP_NOTE,
  OPPORTUNITY_STATUS_LABEL,
} from "@/lib/opportunities";

export function OpportunitiesSection() {
  const items = getOpenOpportunities();
  if (items.length === 0) return null;

  return (
    <section id="oportunidades" className="scroll-mt-24 border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Calendario
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-3xl">
          Próximas oportunidades
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Solo lo que ya tiene fecha o convocatoria abierta.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-xl border border-mf-border bg-white px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-mf-gph px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  {OPPORTUNITY_STATUS_LABEL[item.status]}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  {item.kind}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-mf-gph-ink">{item.title}</h3>
              <p className="mt-1 text-sm font-medium text-mf-text">{item.dateLabel}</p>
              <p className="mt-0.5 text-xs text-mf-text-muted">{item.place}</p>
              <p className="mt-3 flex-1 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
              <Link href={item.href} className="mf-btn-gph mt-4 self-start">
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm leading-6 text-mf-text-muted">{OPPORTUNITY_ROADMAP_NOTE}</p>
      </div>
    </section>
  );
}
