import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { AllianceLockup } from "@/components/ui/gph-logo";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { GPH_ALLIANCE } from "@/lib/gph-alliance";
import { GPH_INVITE_LANDING_PATH, gphInviteTutorHref } from "@/lib/gph-invite-wave";

export const metadata: Metadata = {
  title: "GPH te invita a MiFicha",
  description:
    "Espacio digital para familias GPH: ficha del jugador, oportunidades y seguimiento en mificha.mx. Piloto gratuito.",
};

const BENEFITS = [
  {
    title: "Ficha del jugador",
    detail: "Fotos, video e historia. Opt-in a Explorar para que te vean agentes.",
  },
  {
    title: "Seguimiento",
    detail: "Oportunidades, visorías y convocatorias en tu espacio tutor.",
  },
  {
    title: "GPH cerca",
    detail: "Diagnóstico y entrenamiento de especialización desde la misma plataforma.",
  },
] as const;

export default function GphInviteLandingPage() {
  const campaignLanding = gphInviteTutorHref({ wave: 1, segment: "caliente", absolute: true });
  const ctaHref = `/fut/tutor?src=gph&utm_source=gph&utm_medium=landing&utm_campaign=gph_ola`;

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref={ctaHref} actionLabel="Crear ficha" />
      <main className="flex-1">
        <section className="border-b border-mf-border bg-[#111111] text-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="inline-block rounded-md bg-white px-2.5 py-2">
              <AllianceLockup size="md" showCaption />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f54200]">
              {GPH_ALLIANCE.shortLabel} · invitación
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Ficha, seguimiento y visibilidad en{" "}
              <BrandWordmark className="text-white" />
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              GPH te invita a llenar la ficha de tu hijo, llevar el seguimiento y aparecer en
              Explorar para que agentes de futbol te encuentren. Piloto gratuito para familias
              de la red GPH.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ctaHref} className="mf-btn-gph">
                Entrar al espacio tutor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fut/evaluaciones"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver diagnóstico GPH
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/45">
              Landing: {GPH_INVITE_LANDING_PATH} · campaña: {campaignLanding}
            </p>
          </div>
        </section>

        <section className="border-b border-mf-border bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <h2 className="text-xl font-semibold text-mf-gph-ink sm:text-2xl">
              Qué incluye tu acceso
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {BENEFITS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-mf-border bg-mf-canvas px-5 py-5"
                >
                  <h3 className="text-base font-semibold text-mf-gph-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-mf-border">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-14">
            <h2 className="text-xl font-semibold text-mf-gph-ink">Cómo empezar</h2>
            <ol className="space-y-2 text-sm leading-7 text-mf-text-secondary">
              <li>1. Crea tu cuenta de tutor (correo + WhatsApp).</li>
              <li>2. Arma la ficha: nombre, foto e historia.</li>
              <li>3. Comparte el link o úsalo en visorías y convocatorias.</li>
            </ol>
            <Link href={ctaHref} className="mf-btn-gph self-start">
              Crear mi ficha ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
