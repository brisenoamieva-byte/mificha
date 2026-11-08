import Link from "next/link";
import {
  MEMBERSHIP_OFFER,
  MEMBERSHIP_STATUS_LABEL,
} from "@/lib/membership-offer";
import {
  FAMILY_PRICING_COPY,
  MEMBERSHIP_CHECKOUT_DISABLED,
} from "@/lib/gph-commerce";

export function MembershipOfferSection({
  id = "membresia",
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-y border-mf-border bg-white"
    >
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${compact ? "py-10" : "py-12 sm:py-16"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          {FAMILY_PRICING_COPY.eyebrow}
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-3xl">
          <span className="block text-lg font-medium text-mf-text-secondary sm:text-xl">
            {MEMBERSHIP_OFFER.headlineLead}
          </span>
          <span className="mt-1 block text-3xl font-bold tracking-[-0.03em] text-mf-gph sm:text-4xl">
            {MEMBERSHIP_OFFER.headlineHook}
          </span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          {MEMBERSHIP_OFFER.summary}
        </p>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-mf-gph-ink">
          {FAMILY_PRICING_COPY.today}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERSHIP_OFFER.benefits.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-mf-border bg-mf-canvas px-4 py-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
                {MEMBERSHIP_STATUS_LABEL[item.status]}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-mf-gph-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs leading-6 text-mf-text-muted">
          Especialización: {MEMBERSHIP_OFFER.specializationLimit}
          {MEMBERSHIP_CHECKOUT_DISABLED ? ` ${FAMILY_PRICING_COPY.laterNote}` : null}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/fut/tutor" className="mf-btn-gph">
            Crear ficha de tutor
          </Link>
          <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
            Pagar diagnóstico
          </Link>
          <Link href="/fut/visorias" className="mf-btn-gph-ghost">
            Visorías
          </Link>
        </div>
      </div>
    </section>
  );
}
