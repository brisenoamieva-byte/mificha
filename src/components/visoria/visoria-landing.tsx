import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { VisoriaRegisterForm } from "@/components/visoria/visoria-register-form";
import { VisoriaShareBar } from "@/components/visoria/visoria-share-bar";
import { GphLogo } from "@/components/ui/gph-logo";
import {
  VISORIA_EVENT,
  VISORIA_POSTER,
  VISORIA_VIDEOS,
  visoriaContactWhatsAppHref,
} from "@/lib/visoria-event";

const FACTS = [
  { value: VISORIA_EVENT.cost, label: "Inscripción" },
  { value: "26–27 nov", label: VISORIA_EVENT.city },
  { value: "1.ª División", label: "Chivas y Santos" },
  { value: "Cupo", label: "Por categoría" },
] as const;

export function VisoriaLanding() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="#registro" actionLabel="Registrarme" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-mf-gph-ink text-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-mf-gph" aria-hidden />
          <div
            className="pointer-events-none absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full bg-mf-gph/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-mf-gph-hot/10 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:py-16">
            <div>
              <div className="inline-flex items-center gap-3 rounded-lg bg-white px-3 py-2">
                <GphLogo size="sm" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-ink">
                  {VISORIA_EVENT.organizers} · {VISORIA_EVENT.edition}
                </span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-mf-gph-hot">
                Querétaro · 26 y 27 de noviembre
              </p>
              <h1 className="mt-3 font-semibold tracking-[-0.04em]">
                <span className="block max-w-[12ch] text-[2.35rem] leading-[0.98] sm:text-5xl lg:text-[3.4rem]">
                  Visorías gratuitas.
                </span>
                <span className="mt-4 block max-w-[16ch] text-[1.85rem] leading-[1.02] sm:text-4xl lg:text-[2.75rem]">
                  Club Deportivo Guadalajara
                  <span className="mt-1 block">y Club Santos Laguna</span>
                </span>
              </h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#registro" className="mf-btn-gph">
                  Registrar jugador
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={visoriaContactWhatsAppHref()}
                  className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dudas por WhatsApp
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-xl ring-1 ring-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <Image
                  src={VISORIA_POSTER}
                  alt="Cartel visorías GPH / CRACKS Querétaro 26 y 27 de noviembre"
                  width={1080}
                  height={1350}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
          <dl className="relative mx-auto grid max-w-6xl grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label} className="border-white/10 px-4 py-5 sm:px-6 sm:py-6 sm:even:border-l">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-lg font-semibold tracking-tight text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-xl bg-white px-5 py-5 ring-1 ring-mf-border sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Categorías
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-mf-gph-ink sm:text-xl">
              Femenil y varonil, los dos días
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-mf-text-secondary">
              La rama no define la fecha. El jueves 26 es abierto. El viernes 27 es solo
              para seleccionados.
            </p>
            <div className="mt-4 flex flex-col gap-3 border-t border-mf-border pt-4 sm:flex-row sm:gap-12">
              <p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  Femenil
                </span>
                <span className="mt-1 block text-base font-semibold text-mf-gph-ink">
                  Nacidas de {VISORIA_EVENT.categories.femenil.years}
                </span>
              </p>
              <p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  Varonil
                </span>
                <span className="mt-1 block text-base font-semibold text-mf-gph-ink">
                  Nacidos de {VISORIA_EVENT.categories.varonil.years}
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {VISORIA_EVENT.days.map((day) => {
              const open = day.id === "jueves";
              return (
                <article
                  key={day.id}
                  className={
                    open
                      ? "relative overflow-hidden rounded-xl bg-mf-gph-ink px-6 py-6 text-white sm:px-7 sm:py-7"
                      : "relative overflow-hidden rounded-xl border border-mf-border bg-white px-6 py-6 sm:px-7 sm:py-7"
                  }
                >
                  <div
                    className={
                      open
                        ? "absolute left-0 top-0 h-full w-1 bg-mf-gph"
                        : "absolute left-0 top-0 h-full w-1 bg-mf-border"
                    }
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className={
                        open
                          ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph-hot"
                          : "text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph"
                      }
                    >
                      {open ? "Abierta al público" : "Solo seleccionados"}
                    </p>
                    <p
                      className={
                        open
                          ? "font-semibold tabular-nums leading-none tracking-[-0.06em] text-white/18 text-[4.25rem]"
                          : "font-semibold tabular-nums leading-none tracking-[-0.06em] text-mf-gph-ink/10 text-[4.25rem]"
                      }
                    >
                      {open ? "26" : "27"}
                    </p>
                  </div>
                  <h3
                    className={
                      open
                        ? "mt-2 text-xl font-semibold tracking-tight"
                        : "mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink"
                    }
                  >
                    {day.dateLabel}
                  </h3>
                  <p className={open ? "mt-2 text-sm text-white/70" : "mt-2 text-sm text-mf-text-secondary"}>
                    {day.hours}
                  </p>
                  <p className={open ? "mt-1 text-sm font-medium" : "mt-1 text-sm font-medium text-mf-text"}>
                    {day.venue}
                  </p>
                  <p
                    className={
                      open
                        ? "mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph-hot"
                        : "mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph"
                    }
                  >
                    Femenil y varonil
                  </p>
                  <p
                    className={
                      open
                        ? "mt-4 max-w-md text-sm leading-6 text-white/65"
                        : "mt-4 max-w-md text-sm leading-6 text-mf-text-secondary"
                    }
                  >
                    {day.audience}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-mf-border bg-mf-gph-ink">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-mf-gph sm:text-5xl">
              Los visores
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {VISORIA_VIDEOS.map((video) => (
                <figure key={video.src} className="group">
                  <div className="overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={video.poster}
                      className="aspect-[9/16] max-h-[560px] w-full object-cover"
                    >
                      <source src={video.src} type="video/mp4" />
                    </video>
                  </div>
                  <figcaption className="mt-3">
                    <p className="text-sm font-semibold text-white">{video.label}</p>
                    <p className="mt-0.5 text-xs text-white/50">{video.club}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <VisoriaShareBar />
          </div>
        </section>

        <section id="registro" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Inscripción
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-mf-gph-ink sm:text-3xl">
            Datos del jugador y del tutor
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            Lo llena el padre, madre o tutor. Un minuto. El folio queda en MiFicha;
            Gustavo confirma por WhatsApp. Sin promesa de selección, beca o contrato.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-mf-border bg-white shadow-[var(--mf-shadow)]">
            <div className="h-1 bg-mf-gph" aria-hidden />
            <div className="p-5 sm:p-7">
              <VisoriaRegisterForm />
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-mf-text-muted">
            Menores de edad: el consentimiento es del tutor, conforme a la LFPDPPP y a la
            Ley General de los Derechos de Niñas, Niños y Adolescentes. Evento de
            particulares (GPH / CRACKS / MiFicha) en sedes de Querétaro.{" "}
            <Link href="/fut/aviso-privacidad" className="font-semibold text-mf-brand hover:underline">
              Aviso de privacidad
            </Link>
            .
          </p>
        </section>
      </main>
      <a
        href="#registro"
        className="mf-btn-gph fixed bottom-4 right-4 z-40 shadow-lg sm:hidden"
      >
        Registrarme
      </a>
      <SiteFooter />
    </div>
  );
}
