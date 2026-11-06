import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import { DIAGNOSIS_PRODUCT } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Membresía anual | MiFicha",
  description:
    "Membresía anual para familias: ficha del hijo, precio preferente en el diagnóstico GPH y convocatorias de selectivos.",
};

export default function MembresiaPage() {
  const whatsapp = diagnosisWhatsAppHref();

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
            La idea: un pago al año. El tutor arma la ficha del hijo (fotos, videos,
            goles, historia). Por ser miembro, GPH abre entrenamientos y el diagnóstico
            baja de {DIAGNOSIS_PRODUCT.publicPriceLabel} a{" "}
            {DIAGNOSIS_PRODUCT.memberPriceLabel} MXN. El cobro anual todavía se cierra
            por WhatsApp; no hay cargo mes a mes.
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
              Lista {DIAGNOSIS_PRODUCT.publicPriceLabel}. Miembro{" "}
              {DIAGNOSIS_PRODUCT.memberPriceLabel}.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={whatsapp} className="mf-btn-gph" target="_blank" rel="noopener noreferrer">
              Quiero la membresía
            </a>
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
