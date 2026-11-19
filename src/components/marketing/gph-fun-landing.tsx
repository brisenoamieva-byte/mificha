import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, PartyPopper, Timer } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { GphLogo } from "@/components/ui/gph-logo";
import {
  GPH_FUN,
  GPH_FUN_CONTACT_NAME,
  GPH_FUN_POSTER,
  GPH_FUN_WHATSAPP_DISPLAY,
  gphFunShareHref,
  gphFunWhatsAppHref,
} from "@/lib/gph-fun";

export function GphFunLanding() {
  const whatsappHref = gphFunWhatsAppHref();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref={whatsappHref} actionLabel="Pedir promo" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0a1628] text-white">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#22c55e] to-[#3b82f6]"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                <GphLogo size="sm" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-ink">
                  {GPH_FUN.brand} · {GPH_FUN.alliance}
                </span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">
                {GPH_FUN.eyebrow} · {GPH_FUN.city}
              </p>
              <h1 className="mt-3 max-w-[16ch] text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-[3.2rem]">
                {GPH_FUN.headline}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-[0.95rem] sm:leading-8">
                {GPH_FUN.pitch}
              </p>
              <p className="mt-4 max-w-xl text-base font-semibold text-[#fde68a]">
                {GPH_FUN.promo}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappHref}
                  className="mf-btn-gph"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preguntar por promociones
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={gphFunShareHref()}
                  className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Compartir
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#fbbf24]" />
                  {GPH_FUN.city}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[#fbbf24]" />
                  {GPH_FUN.duration}
                </p>
                <p className="inline-flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-[#fbbf24]" />
                  {GPH_FUN_CONTACT_NAME} · {GPH_FUN_WHATSAPP_DISPLAY}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl ring-1 ring-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <Image
                src={GPH_FUN_POSTER}
                alt="GPH FUN · fiestas futboleras en Querétaro"
                width={1080}
                height={1350}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-mf-border bg-white p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Incluye
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                El festejado es la estrella
              </h2>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {GPH_FUN.features.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl bg-mf-canvas px-3 py-3 text-sm font-semibold text-mf-gph-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-mf-border bg-white p-6 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Contacto
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink">
                Escríbenos por WhatsApp
              </h2>
              <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
                {GPH_FUN_CONTACT_NAME} te atiende en Querétaro. Pregunta por las
                promociones de apertura y arma el día especial de tu festejado.
              </p>
              <a
                href={whatsappHref}
                className="mf-btn-gph mt-6"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {GPH_FUN_WHATSAPP_DISPLAY}
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-4 text-xs text-mf-text-muted">
                También en{" "}
                <Link href="/fut/eventos" className="font-semibold text-mf-gph hover:underline">
                  Eventos
                </Link>
                .
              </p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
