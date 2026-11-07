import Link from "next/link";
import {
  MEMBERSHIP_OFFER,
  MEMBERSHIP_STATUS_LABEL,
} from "@/lib/membership-offer";
import { FAMILY_PRODUCTS } from "@/lib/gph-commerce";

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
          Membresía anual · {FAMILY_PRODUCTS.membership.priceLabel}
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-3xl">
          {MEMBERSHIP_OFFER.headline}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          {MEMBERSHIP_OFFER.summary}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-gph-ink">
          {MEMBERSHIP_OFFER.pilotNote}
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
          Especialización: {MEMBERSHIP_OFFER.specializationLimit} La evaluación GPH (
          {FAMILY_PRODUCTS.diagnosis.priceLabel}) ya incluye estos 12 meses.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/fut/tutor" className="mf-btn-gph">
            Entrar al piloto de tutor
          </Link>
          <Link href="/fut/membresia" className="mf-btn-gph-ghost">
            Ver membresía
          </Link>
          <Link href="/fut/visorias" className="mf-btn-gph-ghost">
            Visorías
          </Link>
        </div>
      </div>
    </section>
  );
}
