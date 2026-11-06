import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FAMILY_PRODUCTS } from "@/lib/gph-commerce";

export const metadata: Metadata = {
  title: "Membresía anual | MiFicha",
  description:
    "Membresía anual $1,200 MXN. Evaluación GPH $2,900 incluye un año de MiFicha. Pago con Mercado Pago.",
};

export default function MembresiaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Familias
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-mf-text sm:text-4xl">
            Membresía anual, no mensual
          </h1>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
            Un pago al año: {FAMILY_PRODUCTS.membership.priceLabel} MXN. El tutor arma la
            ficha del hijo (fotos, videos, goles). GPH abre entrenamientos con cupo. La
            evaluación GPH va aparte ({FAMILY_PRODUCTS.diagnosis.priceLabel}) y ya incluye
            este mismo año de plataforma. Pagas aquí con Mercado Pago.
          </p>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-mf-text-secondary">
            <li>
              <span className="font-semibold text-mf-text">Ficha del hijo. </span>
              Papá o mamá sube evidencia y goles. Eso vive en la misma ficha que ya
              usa el diagnóstico y el torneo.
            </li>
            <li>
              <span className="font-semibold text-mf-text">Entrenamientos GPH. </span>
              Cortesía de la membresía, con cupo y calendario que GPH publique.
            </li>
            <li>
              <span className="font-semibold text-mf-text">Selectivos y visorías. </span>
              Las convocatorias (como{" "}
              <Link href="/fut/visorias" className="font-semibold text-mf-gph hover:underline">
                Querétaro 26 y 27 de noviembre
              </Link>
              ) se publican aquí. El registro ya no va a Google Forms.
            </li>
            <li>
              <span className="font-semibold text-mf-text">Diagnóstico. </span>
              {FAMILY_PRODUCTS.diagnosis.priceLabel} e incluye este año de MiFicha. Si ya
              pagaste membresía y luego quieres evaluación, escríbenos para coordinar.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fut/pagar?sku=membership" className="mf-btn-gph">
              Pagar membresía {FAMILY_PRODUCTS.membership.priceLabel}
            </Link>
            <Link href="/fut/visorias" className="mf-btn-gph-ghost">
              Registrar visoría
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
