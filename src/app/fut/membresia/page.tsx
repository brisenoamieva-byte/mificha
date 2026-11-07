import type { Metadata } from "next";
import Link from "next/link";
import { OpportunitiesSection } from "@/components/marketing/opportunities-section";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FAMILY_PRODUCTS, MEMBERSHIP_CHECKOUT_DISABLED } from "@/lib/gph-commerce";
import {
  MEMBERSHIP_OFFER,
  MEMBERSHIP_STATUS_LABEL,
} from "@/lib/membership-offer";

export const metadata: Metadata = {
  title: "Membresía anual | MiFicha",
  description: MEMBERSHIP_CHECKOUT_DISABLED
    ? "Piloto gratis: arma la ficha del tutor sin cobro. Precio de lista $1,200 al año al cerrar el piloto. Diagnóstico GPH $2,900 incluye el año."
    : "MiFicha $1,200 al año: seguimiento del jugador, visorías de Primera, convocatorias, eventos con descuento y especialización acotada.",
};

export default function MembresiaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {MEMBERSHIP_CHECKOUT_DISABLED
              ? "Familias · piloto gratis"
              : `Familias · ${FAMILY_PRODUCTS.membership.priceLabel} al año`}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-mf-text sm:text-4xl">
            {MEMBERSHIP_OFFER.headline}
          </h1>
          <p className="mt-4 rounded-lg bg-mf-gph-soft px-4 py-3 text-sm leading-7 text-mf-gph-ink">
            {MEMBERSHIP_OFFER.pilotNote}
          </p>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
            {MEMBERSHIP_OFFER.summary}
          </p>

          <ol className="mt-8 space-y-4">
            {MEMBERSHIP_OFFER.benefits.map((item, index) => (
              <li
                key={item.id}
                className="rounded-xl border border-mf-border bg-white px-4 py-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
                  {String(index + 1).padStart(2, "0")} · {MEMBERSHIP_STATUS_LABEL[item.status]}
                </p>
                <h2 className="mt-1.5 text-base font-semibold text-mf-gph-ink">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm leading-7 text-mf-text-secondary">
            <span className="font-semibold text-mf-text">Especialización. </span>
            {MEMBERSHIP_OFFER.specializationLimit}
          </p>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            <span className="font-semibold text-mf-text">Diagnóstico GPH. </span>
            Si pagas la evaluación ({FAMILY_PRODUCTS.diagnosis.priceLabel}), ya incluye
            estos 12 meses: no vuelves a pagar la membresía.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fut/tutor" className="mf-btn-gph">
              Entrar al piloto de tutor
            </Link>
            {MEMBERSHIP_CHECKOUT_DISABLED ? (
              <Link href="/fut/pagar?sku=diagnosis" className="mf-btn-gph-ghost">
                Pagar diagnóstico {FAMILY_PRODUCTS.diagnosis.priceLabel}
              </Link>
            ) : (
              <Link href="/fut/pagar?sku=membership" className="mf-btn-gph-ghost">
                Pagar membresía {FAMILY_PRODUCTS.membership.priceLabel}
              </Link>
            )}
            <Link href="/fut/visorias" className="mf-btn-gph-ghost">
              Visorías
            </Link>
            <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
              Diagnóstico GPH
            </Link>
          </div>
        </section>
        <OpportunitiesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
