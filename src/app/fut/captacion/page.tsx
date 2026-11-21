import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { MEXICO_STATES } from "@/lib/mexico-locations";
import { stateSlug } from "@/lib/viral-share";

export const metadata: Metadata = {
  title: "Captación multi-estado | MiFicha",
  description:
    "Plantillas para academias y torneos fuera de Querétaro: lleva familias a armar ficha y consentir Explorar.",
};

const TEMPLATES = [
  {
    id: "academia",
    title: "Academia / club",
    body: "Comparte el link de registro con padres del plantel. Cada ficha lleva código MF- y puede aparecer en Explorar con consentimiento.",
    cta: "Link padres",
    href: "/fut/entrar?next=/fut/tutor&utm_source=captacion&utm_medium=academia&utm_campaign=nacional",
  },
  {
    id: "torneo",
    title: "Torneo / jornada",
    body: "En la mesa de registro: QR a armar ficha + invitación WhatsApp. UTM por sede para medir referidos.",
    cta: "QR crear ficha",
    href: "/fut/entrar?next=/fut/tutor&utm_source=captacion&utm_medium=torneo&utm_campaign=nacional",
  },
  {
    id: "visorias",
    title: "Visoría / tryout",
    body: "Tras el evento, reclama fichas pending por WhatsApp o correo del tutor. Nudge de consentimiento a 24h.",
    cta: "Ver visorías",
    href: "/fut/visorias?utm_source=captacion&utm_medium=tryout&utm_campaign=nacional",
  },
] as const;

export default async function CaptacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const sp = await searchParams;
  const estadoHint = sp.estado?.trim() || "";

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor"
        actionLabel="Armar ficha"
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Nacionalización · Semanas 5–8
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-mf-gph-ink">
          Captación multi-estado
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Plantillas listas para academias y torneos fuera de Querétaro
          {estadoHint ? (
            <>
              {" "}
              · foco: <strong className="text-mf-gph-ink">{estadoHint}</strong>
            </>
          ) : null}
          . El loop: registrar → ficha → consentimiento → invitar compañero.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TEMPLATES.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-mf-border bg-white px-4 py-5"
            >
              <h2 className="text-base font-semibold text-mf-gph-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-mf-text-secondary">{item.body}</p>
              <Link
                href={
                  estadoHint
                    ? `${item.href}&utm_content=${encodeURIComponent(estadoHint)}`
                    : item.href
                }
                className="mf-btn-gph mt-4 inline-flex"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-mf-gph-ink">
            Landings por estado
          </h2>
          <p className="mt-1 text-sm text-mf-text-secondary">
            Índices agregados SEO-safe (sin PII de menores).
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MEXICO_STATES.slice(0, 24).map((state) => (
              <li key={state}>
                <Link
                  href={`/fut/talento/${stateSlug(state)}`}
                  className="block rounded-lg border border-mf-border bg-white px-3 py-2.5 text-sm font-medium text-mf-text transition hover:border-mf-gph/40 hover:text-mf-gph-ink"
                >
                  {state}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/fut/talento"
            className="mt-4 inline-block text-sm font-semibold text-mf-gph hover:underline"
          >
            Ver todos los estados →
          </Link>
        </section>

        <section className="mt-12 rounded-2xl border border-mf-gph/25 bg-mf-gph-soft px-5 py-6">
          <h2 className="text-lg font-semibold text-mf-gph-ink">
            Copy WhatsApp (referido)
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-mf-text-secondary">
            {`Hola, desde [academia/torneo] te pasamos MiFicha.

Arma la ficha de tu hijo en ~5 min (gratis) y, si firmas consentimiento, puede aparecer en Explorar ante agentes:

https://www.mificha.mx/fut/entrar?next=/fut/tutor&utm_source=referral&utm_medium=whatsapp&utm_campaign=nacional${
              estadoHint ? `&utm_content=${encodeURIComponent(estadoHint)}` : ""
            }`}
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
