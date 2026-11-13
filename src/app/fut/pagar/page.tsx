import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FamilyCheckout } from "@/components/pay/family-checkout";
import { type FamilySku } from "@/lib/gph-commerce";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Pagar diagnóstico GPH | MiFicha",
  description:
    "Evaluación presencial GPH en Querétaro: técnica, táctica, físico, mental y hábitos. $2,030 (−30%; incluye 1 año de MiFicha). Mercado Pago o WhatsApp.",
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
              : "Pagar diagnóstico GPH"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary sm:text-base">
            Sesión presencial en Querétaro con metodología GPH. Sirve para saber en qué
            etapa está el jugador, qué priorizar en el entrenamiento y llevar el seguimiento
            en MiFicha.
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
