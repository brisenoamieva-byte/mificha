import { FileCheck, Scale, Shield } from "lucide-react";
import { WithBrandName } from "@/components/ui/brand-wordmark";

const PILLARS = [
  {
    icon: FileCheck,
    title: "Acta como fuente única",
    description:
      "Goles, minutos y tarjetas salen del acta del organizador. Ninguna academia puede inflar el marcador.",
  },
  {
    icon: Scale,
    title: "Roles definidos",
    description:
      "Organizador publica jornada y acta. Academia opera plantel. MiFicha sincroniza fichas y avisa al tutor.",
  },
  {
    icon: Shield,
    title: "Menores protegidos",
    description:
      "Consentimiento parental, fichas privadas por defecto y tratamiento de datos conforme a LFPDPPP.",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section className="border-b border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Operación real</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Diseñado con reglas claras
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            <WithBrandName>
              MiFicha nace del problema concreto de torneos interescolares en Querétaro:
              stats dispersos, padres sin respuesta y escuelas que no confían en números
              ajenos. La plataforma separa responsabilidades desde el diseño.
            </WithBrandName>
          </p>
        </div>

        <ul className="mt-10 grid gap-5 lg:grid-cols-3">
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
                <WithBrandName>{item.description}</WithBrandName>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
