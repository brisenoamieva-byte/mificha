import { Bell, FileCheck, Users } from "lucide-react";
import { BrandWordmark } from "@/components/ui/brand-wordmark";

const STEPS = [
  {
    icon: Users,
    step: "1",
    title: "Cuenta de tutor",
    description: "La familia crea su cuenta y arma la ficha del hijo sin costo.",
  },
  {
    icon: FileCheck,
    step: "2",
    title: "Academia y torneo",
    description: "La academia opera plantel; el torneo publica el acta cuando esté activo.",
  },
  {
    icon: Bell,
    step: "3",
    title: "Todo en un lugar",
    description: (
      <>
        Material del tutor, stats de partido e informe GPH viven en{" "}
        <BrandWordmark />.
      </>
    ),
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            Tres pasos, una sola fuente
          </h2>
          <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
            Empieza con la ficha del tutor. Cuando haya torneo y diagnóstico, el historial
            se concentra en la misma cuenta.
          </p>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((item) => (
            <li key={item.step} className="mf-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mf-brand-soft text-xs font-semibold text-mf-brand">
                  {item.step}
                </span>
                <div className="mf-icon-brand">
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-mf-text">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
