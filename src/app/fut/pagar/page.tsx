import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FamilyCheckout } from "@/components/pay/family-checkout";
import {
  FAMILY_PRODUCTS,
  MEMBERSHIP_CHECKOUT_DISABLED,
  type FamilySku,
} from "@/lib/gph-commerce";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Pagar diagnóstico GPH | MiFicha",
  description: MEMBERSHIP_CHECKOUT_DISABLED
    ? "Paga la evaluación GPH ($2,900, incluye 1 año de MiFicha). La membresía anual está gratis en el piloto."
    : "Paga la evaluación GPH ($2,900, incluye 1 año de MiFicha) o la membresía anual ($1,200) con Mercado Pago.",
};

function parseSku(value: string | string[] | undefined): FamilySku | undefined {
  const sku = Array.isArray(value) ? value[0] : value;
  if (sku === "diagnosis" || sku === "membership") return sku;
  return undefined;
}

function parsePlayer(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const name = raw?.trim() ?? "";
  return name.length > 0 && name.length <= 80 ? name : undefined;
}

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string | string[]; player?: string | string[] }>;
}) {
  const params = await searchParams;
  const sku = parseSku(params.sku);
  const playerName = parsePlayer(params.player);
  const mercadoPagoReady = isMercadoPagoConfigured();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/pagar" actionLabel="Pagar" />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Familias
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-mf-gph-ink sm:text-4xl">
            {playerName
              ? `Diagnóstico GPH para ${playerName}`
              : MEMBERSHIP_CHECKOUT_DISABLED
                ? "Diagnóstico GPH · membresía gratis en piloto"
                : "Paga aquí. Un año de plataforma."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
            {MEMBERSHIP_CHECKOUT_DISABLED ? (
              <>
                Evaluación GPH {FAMILY_PRODUCTS.diagnosis.priceLabel} (incluye 12 meses de
                MiFicha). La membresía sola no se cobra mientras dure el piloto: entra como
                tutor sin pagar.
              </>
            ) : (
              <>
                Evaluación GPH {FAMILY_PRODUCTS.diagnosis.priceLabel} (incluye 12 meses de
                MiFicha) o membresía sola {FAMILY_PRODUCTS.membership.priceLabel}. Cobro con
                Mercado Pago.
              </>
            )}
          </p>
          <div className="mt-10">
            <FamilyCheckout
              initialSku={sku}
              initialPlayerName={playerName}
              mercadoPagoReady={mercadoPagoReady}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
