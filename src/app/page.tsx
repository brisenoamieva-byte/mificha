import Link from "next/link";
import {
  ArrowRight,
  Building2,
  QrCode,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";

const audiences = [
  {
    icon: Building2,
    emoji: "🏟️",
    title: "Soy academia",
    description: "Gestiona plantel, stats y reportes comparativos a padres.",
    href: "/signup",
    secondaryHref: "/login",
    secondaryLabel: "Iniciar sesión",
    cta: "Registrar academia",
    primary: true,
  },
  {
    icon: QrCode,
    emoji: "👨‍👦",
    title: "Soy padre",
    description:
      "Escanea el QR o abre el link de tu hijo. Sin cuenta necesaria.",
    href: "/padres",
    cta: "Abrir ficha de mi hijo",
    primary: false,
  },
  {
    icon: Search,
    emoji: "🔍",
    title: "Visorías / scouts",
    description: "Explora talento verificado en academias y jugadores públicos.",
    href: "/explorar",
    cta: "Explorar directorio",
    primary: false,
  },
];

const proofPoints = [
  { icon: TrendingUp, label: "Reportes comparativos jugador vs plantel" },
  { icon: ShieldCheck, label: "Stats verificados por la academia" },
  { icon: QrCode, label: "Ficha pública lista para compartir" },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
            <div className="max-w-3xl">
              <p className="mf-section-kicker">MiFicha — La ficha técnica digital</p>
              <h1 className="mt-3 text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-mf-text sm:text-[3rem]">
                La ficha que padres comparten y scouts confían
              </h1>
              <p className="mt-5 max-w-2xl text-[1.0625rem] leading-7 text-mf-text-secondary">
                Tres formas de entrar, una plataforma. Solo las academias necesitan
                cuenta para operar el plantel.
              </p>
            </div>
          </div>
        </section>

        <section id="accesos" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {audiences.map((item) => (
              <article
                key={item.title}
                className="mf-card flex flex-col p-6 transition hover:border-mf-brand/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-mf-brand-soft text-mf-brand">
                    <item.icon className="h-4 w-4" />
                  </div>
                </div>
                <h2 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-mf-text">
                  {item.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-mf-text-secondary">
                  {item.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={item.href}
                    className={item.primary ? "mf-btn-primary" : "mf-btn-secondary"}
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {item.secondaryHref ? (
                    <Link href={item.secondaryHref} className="mf-btn-ghost">
                      {item.secondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-mf-border bg-mf-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="flex items-start gap-3">
                  <div className="mt-0.5 text-mf-brand">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-6 text-mf-text-secondary">{point.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-mf-text">
                Padres: cero fricción
              </h2>
              <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
                QR, link o reporte por email. Sin registro, sin app, sin contraseña.
                Ideal para compartir en WhatsApp después de cada partido.
              </p>
              <Link href="/padres" className="mf-btn-secondary mt-5 inline-flex">
                Ir a acceso padres
              </Link>
            </div>

            <div id="ejemplo-ficha" className="mf-card-elevated overflow-hidden">
              <div className="border-b border-mf-border-subtle px-5 py-4">
                <p className="text-sm font-semibold text-mf-text">Ejemplo · Ficha verificada</p>
                <p className="text-sm text-mf-text-secondary">Passport 78 · Stats de temporada</p>
              </div>
              <div className="grid grid-cols-3 gap-px bg-mf-border-subtle">
                {[
                  { label: "Partidos", value: "12" },
                  { label: "Goles", value: "9" },
                  { label: "Asist.", value: "4" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-mf-surface px-4 py-5 text-center">
                    <p className="text-2xl font-semibold tabular-nums text-mf-text">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-mf-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <div className="mf-card grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-mf-text">
                Scouts: descubrimiento público primero
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-mf-text-secondary">
                Explora academias y jugadores con PASSPORT Score. Las cuentas scout
                llegarán en una fase posterior para favoritos y listas.
              </p>
            </div>
            <Link href="/explorar" className="mf-btn-primary w-fit">
              Explorar talento
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
