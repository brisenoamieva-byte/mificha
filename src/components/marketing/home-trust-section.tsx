import { Lock, ShieldCheck } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Stats del organizador",
    description:
      "Goles, minutos y tarjetas los publica el torneo. La academia no puede editarlos.",
  },
  {
    icon: Lock,
    title: "Privacidad de menores",
    description:
      "Consentimiento parental, ficha privada por defecto y tratamiento conforme a LFPDPPP.",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section className="border-b border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Confianza</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Datos verificables y menores protegidos
          </h2>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-mf-border bg-mf-canvas p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mf-brand-soft text-mf-brand">
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-mf-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
