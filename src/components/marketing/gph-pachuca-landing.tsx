import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Share2 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { AllianceLockup } from "@/components/ui/gph-logo";
import {
  GPH_PACHUCA_POSTER,
  GPH_PACHUCA_SEGUNDA_FASE,
  gphPachucaShareHref,
} from "@/lib/gph-pachuca-segunda-fase";

function ProseBlock({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: readonly string[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-mf-gph-ink sm:text-2xl">
        {title}
      </h2>
      {paragraphs.map((text) => (
        <p key={text.slice(0, 48)} className="text-sm leading-7 text-mf-text-secondary sm:text-[0.95rem] sm:leading-8">
          {text}
        </p>
      ))}
    </section>
  );
}

export function GphPachucaLanding() {
  const shareHref = gphPachucaShareHref();
  const data = GPH_PACHUCA_SEGUNDA_FASE;

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Soy tutor" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#071225] text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-mf-gph" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12 lg:py-16">
            <div>
              <AllianceLockup size="md" showCaption />
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-mf-gph-hot">
                {data.alliance} · {data.eyebrow}
              </p>
              <h1 className="mt-3 max-w-[18ch] text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
                {data.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg font-medium text-white/82">
                {data.headline}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                {data.origin}. Segunda fase en {data.place}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={shareHref}
                  className="mf-btn-gph"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Compartir
                  <Share2 className="h-4 w-4" />
                </a>
                <Link href="/fut/visorias" className="mf-btn-gph-ghost">
                  Ver visorías
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl ring-1 ring-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <Image
                src={GPH_PACHUCA_POSTER}
                alt="Orgullo GPH · cuatro jugadores en segunda fase con Club Pachuca"
                width={1080}
                height={1350}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
          <ProseBlock title="El momento" paragraphs={data.paragraphs} />
          <ProseBlock title="Gracias al Club Pachuca" paragraphs={data.thanksClub} />
          <ProseBlock title="A los papás y las familias" paragraphs={data.thanksFamilies} />
          <ProseBlock
            title="Academias, escuelas y entrenadores"
            paragraphs={data.thanksAcademies}
          />
          <ProseBlock title="A nuestros cuatro jugadores" paragraphs={data.toPlayers} />
          <ProseBlock title="Esto apenas comienza" paragraphs={data.closing} />

          <blockquote className="rounded-2xl border border-mf-border bg-white px-5 py-6 text-base font-semibold leading-7 text-mf-gph-ink sm:px-7">
            {data.motto}
            <footer className="mt-3 text-sm font-medium text-mf-text-secondary">
              {data.alliance}
            </footer>
          </blockquote>

          <div className="flex flex-wrap gap-3">
            <a
              href={shareHref}
              className="mf-btn-gph"
              target="_blank"
              rel="noopener noreferrer"
            >
              Compartir por WhatsApp
            </a>
            <Link href="/fut" className="mf-btn-gph-ghost">
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
