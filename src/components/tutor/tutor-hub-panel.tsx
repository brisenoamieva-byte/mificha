import Link from "next/link";
import {
  getOpenOpportunities,
  OPPORTUNITY_ROADMAP_NOTE,
  OPPORTUNITY_STATUS_LABEL,
} from "@/lib/opportunities";
import {
  gphFreeTrainingBookingHref,
  gphFreeTrainingBookingIsCalendly,
  TUTOR_APP_INSTALL,
  TUTOR_SERVICE_STATUS_LABEL,
  TUTOR_SERVICES,
} from "@/lib/tutor-hub";
import { SponsorSlot } from "@/components/marketing/sponsor-slot";
import { TutorInstallHint } from "@/components/tutor/tutor-install-hint";

const nav = [
  { href: "#noticias", label: "Noticias" },
  { href: "#servicios", label: "Servicios" },
  { href: "#gph-gratis", label: "GPH gratis" },
  { href: "#ficha", label: "Mi ficha" },
  { href: "#app", label: "App" },
] as const;

export function TutorHubPanel() {
  const news = getOpenOpportunities();
  const bookingHref = gphFreeTrainingBookingHref();
  const isCalendly = gphFreeTrainingBookingIsCalendly();

  return (
    <div className="space-y-10">
      <nav
        aria-label="Secciones del espacio tutor"
        className="flex flex-wrap gap-2 border-b border-mf-border pb-4"
      >
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-lg border border-mf-border bg-white px-3 py-1.5 text-xs font-semibold text-mf-gph-ink hover:border-mf-gph/40"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section id="noticias" className="scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Noticias
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink sm:text-2xl">
          Oportunidades abiertas
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Visorías, torneos y alianzas con fecha o convocatoria real.
        </p>

        {news.length === 0 ? (
          <p className="mt-5 text-sm text-mf-text-muted">
            No hay convocatorias abiertas ahora. Te avisamos aquí cuando salga la siguiente.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {news.map((item) => (
              <li
                key={item.id}
                className="flex flex-col rounded-xl border border-mf-border bg-white px-5 py-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-mf-gph px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    {OPPORTUNITY_STATUS_LABEL[item.status]}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                    {item.kind}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-mf-gph-ink">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-mf-text">{item.dateLabel}</p>
                <p className="mt-0.5 text-xs text-mf-text-muted">{item.place}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-mf-text-secondary">
                  {item.detail}
                </p>
                <Link href={item.href} className="mf-btn-gph mt-4 self-start">
                  {item.cta}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm leading-6 text-mf-text-muted">{OPPORTUNITY_ROADMAP_NOTE}</p>
      </section>

      <SponsorSlot placement="tutor_card" />

      <section id="servicios" className="scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Servicios
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink sm:text-2xl">
          Todo desde tu cuenta
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Ficha + seguimiento + visibilidad ante agentes. También convocatorias, visorías y
          GPH en un solo lugar.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {TUTOR_SERVICES.map((service) => (
            <li
              key={service.id}
              className="flex flex-col rounded-xl border border-mf-border bg-white px-5 py-5"
            >
              <span className="self-start rounded-md bg-mf-gph-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-gph">
                {TUTOR_SERVICE_STATUS_LABEL[service.status]}
              </span>
              <h3 className="mt-3 text-base font-semibold text-mf-gph-ink">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-mf-text-secondary">
                {service.detail}
              </p>
              <a href={service.href} className="mf-btn-gph-ghost mt-4 self-start">
                {service.cta}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="gph-gratis"
        className="scroll-mt-24 rounded-xl border border-mf-gph/25 bg-mf-gph-soft px-5 py-6 sm:px-7 sm:py-7"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          GPH · especialización
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink sm:text-2xl">
          Solicita tu entrenamiento gratuito con GPH
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          {isCalendly
            ? "Elige un espacio disponible en el calendario. Confirmamos cupo y sede contigo."
            : "Revisa disponibilidad con GPH por WhatsApp. Cuando tengamos Calendly público, el mismo botón abrirá el calendario."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mf-btn-gph"
          >
            {isCalendly ? "Ver espacios en Calendly" : "Solicitar por WhatsApp"}
          </a>
          <Link href="/fut/evaluaciones" className="mf-btn-gph-ghost">
            Ver diagnóstico GPH
          </Link>
        </div>
      </section>

      <section id="app" className="scroll-mt-24 rounded-xl border border-mf-border bg-white px-5 py-6 sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          App MiFicha
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
          {TUTOR_APP_INSTALL.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          {TUTOR_APP_INSTALL.detail}
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-mf-text-secondary">
          <li>
            <span className="font-semibold text-mf-gph-ink">Android:</span>{" "}
            {TUTOR_APP_INSTALL.androidHint}
          </li>
          <li>
            <span className="font-semibold text-mf-gph-ink">iPhone:</span>{" "}
            {TUTOR_APP_INSTALL.iosHint}
          </li>
        </ul>
        <p className="mt-3 text-xs leading-5 text-mf-text-muted">{TUTOR_APP_INSTALL.storeNote}</p>
        <TutorInstallHint />
      </section>
    </div>
  );
}
