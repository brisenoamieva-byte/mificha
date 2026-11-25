import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GphEnrollmentForm } from "@/components/gph/gph-enrollment-form";
import { SiteHeader } from "@/components/marketing/site-header";
import { AllianceLockup } from "@/components/ui/gph-logo";
import { GPH_ENROLLMENT_PATH } from "@/lib/gph-enrollment";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Inscripción alumnos GPH | MiFicha",
  description:
    "Registra a tu hijo en Academia Real GPH: ficha MiFicha, reglamento y aviso de privacidad.",
  alternates: { canonical: GPH_ENROLLMENT_PATH },
};

export default async function GphInscripcionPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) qs.set(key, value);
  }
  const nextPath = qs.toString()
    ? `${GPH_ENROLLMENT_PATH}?${qs.toString()}`
    : GPH_ENROLLMENT_PATH;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/fut/entrar?next=${encodeURIComponent(nextPath)}`);
  }

  const displayName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    null;

  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/tutor"
        actionLabel="Mis fichas"
        showAcademyLink={false}
        minimal
      />
      <main className="flex-1">
        <section className="border-b border-mf-border bg-[#0f1720] text-white">
          <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
            <div className="inline-block rounded-md bg-white px-2.5 py-2">
              <AllianceLockup size="sm" showCaption />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f54200]">
              Academia Real GPH
            </p>
            <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight sm:text-3xl">
              Inscripción de alumno
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Ficha en MiFicha + firma del reglamento. GPH confirma nivel y monto
              después.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
          <GphEnrollmentForm
            defaultEmail={user.email}
            defaultName={displayName}
          />
          <p className="mt-6 text-center text-xs text-mf-text-muted">
            ¿Solo quieres la ficha sin inscripción GPH?{" "}
            <Link href="/fut/tutor" className="font-semibold text-mf-brand">
              Ir a mis fichas
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
