import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Clock3 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { GphLogo } from "@/components/ui/gph-logo";
import {
  CRACKS_TRYOUTS,
  CRACKS_TRYOUTS_POSTER,
  CRACKS_TRYOUTS_WHATSAPP_DISPLAY,
  cracksTryoutsShareHref,
  cracksTryoutsWhatsAppHref,
} from "@/lib/cracks-tryouts";

export function CracksTryoutsLanding() {
  const whatsappHref = cracksTryoutsWhatsAppHref();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref={whatsappHref} actionLabel="Solicitar liga" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0b0b0b] text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#e11d2e]" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                <GphLogo size="sm" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-ink">
                  {CRACKS_TRYOUTS.brand} · alianza {CRACKS_TRYOUTS.alliance}
                </span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#fb7185]">
                {CRACKS_TRYOUTS.monthLabel} · {CRACKS_TRYOUTS.city}
              </p>
              <h1 className="mt-3 max-w-[14ch] text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[3.35rem]">
                {CRACKS_TRYOUTS.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg font-medium text-white/80">
                {CRACKS_TRYOUTS.headline}
              </p>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
                {CRACKS_TRYOUTS.pitch}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappHref} className="mf-btn-gph" target="_blank" rel="noopener noreferrer">
                  Solicitar liga de registro
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={cracksTryoutsShareHref()}
                  className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Compartir
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#fb7185]" />
                  {CRACKS_TRYOUTS.venue}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#fb7185]" />
                  {CRACKS_TRYOUTS.hours}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl ring-1 ring-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <Image
                src={CRACKS_TRYOUTS_POSTER}
                alt="Cartel CRACKS try outs Querétaro noviembre 2026"
                width={1080}
                height={1350}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-2xl border border-mf-border bg-white p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e11d2e]">
                Formación
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                Equipos competitivos desde los 5 años
              </h2>
              <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
                {CRACKS_TRYOUTS.mission}
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {CRACKS_TRYOUTS.pillars.map((pillar) => (
                  <li
                    key={pillar}
                    className="rounded-xl bg-mf-canvas px-3 py-3 text-sm font-semibold text-mf-gph-ink"
                  >
                    {pillar}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-mf-border bg-white p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e11d2e]">
                Categorías
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                Infantiles y juveniles
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CRACKS_TRYOUTS.categoriesYoung.map((item) => (
                  <div
                    key={item.year}
                    className="rounded-xl bg-[#e11d2e] px-3 py-3 text-center text-white"
                  >
                    <p className="text-lg font-semibold">{item.year}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-white/80">
                      {item.age}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CRACKS_TRYOUTS.categoriesOlder.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-[#111] px-3 py-3 text-center text-white"
                  >
                    <p className="text-lg font-semibold">{item.label}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-white/70">
                      {item.years}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e11d2e]">
              Audios
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
              Escucha la invitación
            </h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {CRACKS_TRYOUTS.audios.map((audio) => (
                <figure
                  key={audio.src}
                  className="rounded-2xl border border-mf-border bg-mf-canvas px-4 py-4 sm:px-5"
                >
                  <figcaption className="text-sm font-semibold text-mf-gph-ink">
                    {audio.label}
                  </figcaption>
                  <audio controls preload="metadata" className="mt-3 w-full">
                    <source src={audio.src} type="audio/mpeg" />
                  </audio>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="overflow-hidden rounded-2xl border border-[#fda4af] bg-white shadow-[0_12px_32px_-20px_rgba(225,29,72,0.45)]">
            <div className="bg-[#fff1f2] px-5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d2e]">
                Registro
              </p>
            </div>
            <div className="px-5 py-6 sm:px-7">
              <h2 className="text-2xl font-semibold tracking-tight text-mf-gph-ink">
                Solicita tu liga de registro
              </h2>
              <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
                Envía por WhatsApp el nombre y el año de nacimiento de tu hijo para
                recibir la información de las pruebas. Evaluaciones durante todo
                noviembre en {CRACKS_TRYOUTS.venue}.
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mf-btn-gph mt-5"
              >
                WhatsApp {CRACKS_TRYOUTS_WHATSAPP_DISPLAY}
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-4 text-xs leading-6 text-mf-text-muted">
                También puedes ver las{" "}
                <Link href="/fut/visorias" className="font-semibold text-mf-brand hover:underline">
                  visorías GPH / CRACKS con Chivas y Santos
                </Link>{" "}
                del 26 y 27 de noviembre.
              </p>
            </div>
          </div>
        </section>
      </main>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mf-btn-gph fixed bottom-4 right-4 z-40 shadow-lg sm:hidden"
      >
        Solicitar liga
      </a>
      <SiteFooter />
    </div>
  );
}
