import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Tus fichas | MiFicha",
  description:
    "Cuenta persona: arma fichas de jugadores, seguimiento y visibilidad en Explorar.",
};

export default async function TutorPage() {
  // Misma puerta que “Entrar”: sin sesión → /fut/entrar (un solo login).
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/fut/entrar?next=/fut/tutor");
  }

  return (
    <div className="flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/tutor"
        actionLabel="Mis fichas"
        showAcademyLink={false}
      />
      <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 min-w-0 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            Cuenta persona
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
            Tus fichas
          </h1>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Tutor o representante: misma cuenta. Publica fichas con consentimiento; la
            membresía (gratis por tiempo limitado; después $50 USD/año) desbloquea detalle en
            Explorar.
          </p>
        </div>

        <section id="ficha" className="scroll-mt-24">
          <TutorWorkspace />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
