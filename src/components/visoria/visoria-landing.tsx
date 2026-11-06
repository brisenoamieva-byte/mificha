import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { VisoriaRegisterForm } from "@/components/visoria/visoria-register-form";
import { VisoriaShareBar } from "@/components/visoria/visoria-share-bar";
import {
  VISORIA_EVENT,
  VISORIA_POSTER,
  VISORIA_VIDEOS,
  visoriaContactWhatsAppHref,
} from "@/lib/visoria-event";

export function VisoriaLanding() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="#registro"
        actionLabel="Registrarme"
      />
      <main className="flex-1">
        <section className="border-b border-mf-gph/15 bg-mf-gph-ink text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mf-gph-hot">
                {VISORIA_EVENT.organizers} · {VISORIA_EVENT.edition}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {VISORIA_EVENT.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                Visores oficiales de Primera División. {VISORIA_EVENT.cost}. Cupo por
                categoría. Confirmamos por WhatsApp el día, la sede y el horario.
              </p>
              <p className="mt-3 text-sm font-medium text-white">
                {VISORIA_EVENT.clubs.join(" · ")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#registro" className="mf-btn-gph">
                  Registrar jugador
                </a>
                <a
                  href={visoriaContactWhatsAppHref()}
                  className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dudas por WhatsApp
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/15">
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
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {VISORIA_EVENT.days.map((day) => (
              <article
                key={day.id}
                className="rounded-2xl border border-mf-border bg-white px-5 py-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  {day.id === "jueves" ? "Abierta" : "Cerrada"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-mf-gph-ink">{day.dateLabel}</h2>
                <p className="mt-1 text-sm text-mf-text-secondary">{day.hours}</p>
                <p className="mt-1 text-sm font-medium text-mf-text">{day.venue}</p>
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">{day.audience}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-mf-gph-soft px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-gph">
                Femenil
              </p>
              <p className="mt-1 text-lg font-semibold text-mf-gph-ink">
                Nacidas de {VISORIA_EVENT.categories.femenil.years}
              </p>
            </div>
            <div className="rounded-2xl bg-mf-gph-soft px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mf-gph">
                Varonil
              </p>
              <p className="mt-1 text-lg font-semibold text-mf-gph-ink">
                Nacidos de {VISORIA_EVENT.categories.varonil.years}
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-mf-border bg-white">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <VisoriaShareBar />
          </div>
        </section>

        <section id="registro" className="scroll-mt-20 mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Convocatoria
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-mf-gph-ink">
            Los visores te hablan
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Mira los mensajes de Chivas y Santos Laguna y registra al jugador aquí mismo.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {VISORIA_VIDEOS.map((video) => (
              <figure key={video.src} className="overflow-hidden rounded-2xl border border-mf-border bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={video.poster}
                  className="mx-auto max-h-[520px] w-full bg-black"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
                <figcaption className="bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-mf-gph-ink">{video.label}</p>
                  <p className="text-xs text-mf-text-secondary">{video.club}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <h2 className="mt-10 text-2xl font-semibold text-mf-gph-ink">
            Datos del jugador y del tutor
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Lo llena el padre, madre o tutor. Toma un minuto. El folio queda en MiFicha;
            Gustavo confirma por WhatsApp. Sin promesa de selección, beca o contrato.
          </p>
          <div className="mt-6 rounded-2xl border border-mf-border bg-white p-5 sm:p-6">
            <VisoriaRegisterForm />
          </div>
          <p className="mt-4 text-xs leading-6 text-mf-text-muted">
            Menores de edad: el consentimiento es del tutor, conforme a la LFPDPPP y a la
            Ley General de los Derechos de Niñas, Niños y Adolescentes. El evento es de
            particulares (GPH / CRACKS / MiFicha) en sedes de Querétaro.{" "}
            <Link href="/fut/aviso-privacidad" className="font-semibold text-mf-brand hover:underline">
              Aviso de privacidad
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
