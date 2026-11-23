import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppInstallPanel } from "@/components/marketing/app-install-panel";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { APP_INSTALL } from "@/lib/app-install";

export const metadata: Metadata = {
  title: "Descargar app · Android e iPhone",
  description:
    "Instala MiFicha en tu celular: app gratis para Android e iPhone desde el navegador.",
};

export default function AppInstallPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader
        actionHref="/fut/entrar?next=/fut/tutor"
        actionLabel="Entrar"
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 flex items-center gap-4">
          <Image
            src="/brand/mificha-app-icon.png"
            alt="Ícono MiFicha"
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-2xl shadow-sm"
            priority
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-brand">
              {APP_INSTALL.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-mf-gph-ink sm:text-3xl">
              {APP_INSTALL.title}
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-mf-border bg-white px-4 py-6 sm:px-6">
          <AppInstallPanel hideIntro />
        </div>

        <p className="mt-10 text-sm text-mf-text-secondary">
          ¿Ya la instalaste?{" "}
          <Link href="/fut/entrar?next=/fut/tutor" className="font-semibold text-mf-brand hover:underline">
            Entra a tus fichas
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
