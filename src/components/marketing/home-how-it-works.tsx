import { Bell, FileCheck, Users } from "lucide-react";
import { WithBrandName } from "@/components/ui/brand-wordmark";

const STEPS = [
  {
    icon: Users,
    step: "1",
    title: "Plantel y tutores",
    description:
      "La academia carga jugadores, consentimiento y contacto del tutor. Es lo único que opera en cancha.",
  },
  {
    icon: FileCheck,
    step: "2",
    title: "Acta oficial del torneo",
    description:
      "El organizador publica calendario, marcador y acta con goles, minutos y tarjetas por jugador.",
  },
  {
    icon: Bell,
    step: "3",
    title: "MiFicha sincroniza",
    description:
      "Cruzamos el acta con el plantel, actualizamos Passport e insignias y avisamos al tutor.",
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Tres pasos, una sola fuente de verdad
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            No pedimos a cada coach que reescriba el partido. El acta del torneo
            alimenta cada ficha.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {STEPS.map((item) => (
            <li key={item.step} className="mf-card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mf-brand-soft text-sm font-semibold text-mf-brand">
                  {item.step}
                </span>
                <div className="mf-icon-brand">
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="mt-4 text-base font-semibold text-mf-text">
                <WithBrandName>{item.title}</WithBrandName>
              </h3>
              <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
