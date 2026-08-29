import type { Metadata } from "next";
import { AcademyForm } from "@/components/dashboard/academy-form";
import { AcademyTeamPanel } from "@/components/dashboard/academy-team-panel";

export const metadata: Metadata = {
  title: "Configuración | MiFicha",
};

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-2 text-slate-600">
          Edita los datos de tu academia, landing pública y branding.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <AcademyForm />
      </div>

      <AcademyTeamPanel />
    </div>
  );
}
