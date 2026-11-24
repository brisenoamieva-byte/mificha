import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";
import { APP_INSTALL_PATH } from "@/lib/app-install";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Tus fichas | MiFicha",
  description: "Arma tu ficha, súmale el partido y compártela.",
};

export default async function TutorPage() {
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
        minimal
      />
      <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 min-w-0 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
            Tus fichas
          </h1>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Aquí está la ficha. Súmale el partido del domingo o compártela.
          </p>
          <p className="mt-2 text-sm">
            <Link
              href={APP_INSTALL_PATH}
              className="font-semibold text-mf-brand hover:underline"
            >
              App · Android e iPhone
            </Link>
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
