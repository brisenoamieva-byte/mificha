import type { Metadata } from "next";
import { AcademyForm } from "@/components/dashboard/academy-form";

export const metadata: Metadata = {
  title: "Configuración | MiFicha",
};

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
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
    </div>
  );
}
