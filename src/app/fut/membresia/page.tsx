import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { FAMILY_PRODUCTS } from "@/lib/gph-commerce";

export const metadata: Metadata = {
  title: "Membresía anual | MiFicha",
  description:
    "Membresía anual $1,200 MXN: el tutor lleva el seguimiento del hijo con videos, fotos e historia en MiFicha.",
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
            El seguimiento de tu hijo, un año
          </h1>
          <p className="mt-4 rounded-lg bg-mf-gph-soft px-4 py-3 text-sm leading-7 text-mf-gph-ink">
            <span className="font-semibold">Piloto gratuito ahora.</span> Puedes entrar
            como tutor, subir material y generar la ficha presentable sin pagar los{" "}
            {FAMILY_PRODUCTS.membership.priceLabel}. El cobro anual se activa después del
            piloto.
          </p>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
            Cuando el piloto cierre, la membresía será {FAMILY_PRODUCTS.membership.priceLabel}{" "}
            MXN al año. Entras como papá, mamá o tutor y armas la ficha: videos, fotos e
            historia para universidades, visorías o clubes.
          </p>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-mf-text-secondary">
            <li>
              <span className="font-semibold text-mf-text">Tú subes el material. </span>
              Clips, fotos, goles y notas del jugador. Queda en su ficha, no en el feed
              de nadie.
            </li>
            <li>
              <span className="font-semibold text-mf-text">Un lugar para el año. </span>
              Partidos, visorías y, si lo contratas, el diagnóstico GPH se leen sobre la
              misma ficha.
            </li>
            <li>
              <span className="font-semibold text-mf-text">Privado por defecto. </span>
              El tutor decide si esa ficha se comparte con un club. Los menores no se
              publican solos.
            </li>
            <li>
              <span className="font-semibold text-mf-text">La evaluación ya incluye el año. </span>
              Si pagas el diagnóstico GPH ({FAMILY_PRODUCTS.diagnosis.priceLabel}), no
              vuelves a pagar estos {FAMILY_PRODUCTS.membership.priceLabel}.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fut/tutor" className="mf-btn-gph">
              Entrar al piloto de tutor
            </Link>
            <Link href="/fut/pagar?sku=membership" className="mf-btn-gph-ghost">
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
