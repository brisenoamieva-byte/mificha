import Link from "next/link";
import { BrandWordmark } from "@/components/ui/brand-wordmark";

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-mf-text sm:text-xl">
            Tutor arma la ficha · academia suma el torneo · GPH deja el informe en{" "}
            <BrandWordmark className="text-lg sm:text-xl" />.
          </h2>
        </div>
        <Link href="/fut/tutor" className="mf-btn-gph-ghost shrink-0 self-start sm:self-center">
          Empezar como tutor
        </Link>
      </div>
    </section>
  );
}
