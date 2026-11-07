import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-header";
import { TutorWorkspace } from "@/components/tutor/tutor-workspace";

export const metadata: Metadata = {
  title: "Tutor · piloto | MiFicha",
  description:
    "Organiza fotos, videos e historia de tu hijo y genera una ficha para universidades o visorías. Piloto gratuito.",
};

export default function TutorPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-mf-canvas">
      <SiteHeader actionHref="/fut/tutor" actionLabel="Tutor" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <TutorWorkspace />
      </main>
      <SiteFooter />
    </div>
  );
}
