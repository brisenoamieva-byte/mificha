import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FamilyCheckout } from "@/components/pay/family-checkout";
import { FAMILY_PRODUCTS, type FamilySku } from "@/lib/gph-commerce";

export const metadata: Metadata = {
  title: "Pagar evaluación o membresía | MiFicha",
  description:
    "Paga la evaluación GPH ($2,900, incluye 1 año de MiFicha) o solo la membresía anual ($1,200) con Mercado Pago.",
};

function parseSku(value: string | string[] | undefined): FamilySku | undefined {
  const sku = Array.isArray(value) ? value[0] : value;
  if (sku === "diagnosis" || sku === "membership") return sku;
  return undefined;
}

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string | string[] }>;
}) {
  const params = await searchParams;
  const sku = parseSku(params.sku);

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/pagar" actionLabel="Pagar" />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Familias
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-mf-gph-ink sm:text-4xl">
            Paga aquí. Un año de plataforma.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
            Evaluación GPH {FAMILY_PRODUCTS.diagnosis.priceLabel} (incluye 12 meses de MiFicha)
            o membresía sola {FAMILY_PRODUCTS.membership.priceLabel}. Cobro con Mercado Pago.
          </p>
          <div className="mt-10">
            <FamilyCheckout initialSku={sku} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
