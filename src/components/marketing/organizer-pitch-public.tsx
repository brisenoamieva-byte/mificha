import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { ORGANIZER_PITCH_SLIDES } from "@/lib/organizer-pitch-deck";
import {
  ORGANIZER_CONTACT,
  organizerMailtoHref,
  organizerWhatsAppHref,
} from "@/lib/organizer-contact";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

export function OrganizerPitchPublic() {
  const whatsapp = organizerWhatsAppHref();
  const mailto = organizerMailtoHref();

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
            <p className="mf-marketing-eyebrow">Presentación · organizadores</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-mf-text">
              <BrandWordmark /> para tu torneo
            </h1>
            <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
              Versión corta para platicar con organizadores. Sin login.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 sm:py-12">
          {ORGANIZER_PITCH_SLIDES.map((slide, index) => (
            <article
              key={slide.id}
              className="rounded-2xl border border-mf-border bg-white p-5 sm:p-7"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-brand">
                {index + 1} / {ORGANIZER_PITCH_SLIDES.length}
                {slide.kicker ? ` · ${slide.kicker}` : ""}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-mf-text sm:text-2xl">
                {slide.title}
              </h2>
              {slide.subtitle ? (
                <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
                  {slide.subtitle}
                </p>
              ) : null}
              {slide.bullets?.length ? (
                <ul className="mt-4 space-y-2">
                  {slide.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-sm leading-7 text-mf-text-secondary"
                    >
                      · {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
              {slide.stats?.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {slide.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-mf-canvas px-3 py-3"
                    >
                      <p className="text-lg font-semibold text-mf-brand">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-xs text-mf-text-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              {slide.highlight ? (
                <p className="mt-4 text-sm font-medium text-mf-text">
                  {slide.highlight}
                </p>
              ) : null}
            </article>
          ))}

          <div className="rounded-2xl border border-mf-brand/20 bg-mf-brand-soft/40 p-5 sm:p-7">
            <p className="text-sm font-semibold text-mf-text">Para agendar</p>
            <p className="mt-1 text-sm text-mf-text-secondary">
              WhatsApp {ORGANIZER_CONTACT.phoneDisplay} o correo a{" "}
              {ORGANIZER_CONTACT.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsapp}
                className="mf-btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a href={mailto} className="mf-btn-accent">
                <Mail className="h-4 w-4" aria-hidden />
                Correo
              </a>
              <Link href="/fut/organizadores" className="mf-btn-secondary">
                Página organizadores
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
