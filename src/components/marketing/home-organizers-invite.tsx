import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardCheck, Link2 } from "lucide-react";
import { BrandWordmark } from "@/components/ui/brand-wordmark";

const BENEFITS = [
  {
    icon: CalendarDays,
    title: "Calendario oficial",
    detail: "Publicas jornadas y sedes. Academias y padres ven la misma fuente.",
  },
  {
    icon: ClipboardCheck,
    title: "Acta y marcador",
    detail: "Goles, tarjetas y minutos quedan verificados por partido.",
  },
  {
    icon: Link2,
    title: "Datos en cada ficha",
    detail: "MiFicha sincroniza el acta con planteles y avisa a tutores.",
  },
] as const;

export function HomeOrganizersInvite() {
  return (
    <section
      id="organizadores"
      className="scroll-mt-24 border-b border-mf-border bg-mf-brand"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Organizadores de torneo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Registra tu torneo en <BrandWordmark className="text-white" />
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
            Conecta calendario y datos oficiales con academias, fichas y tutores.
            Registro gratis por WhatsApp o correo.
          </p>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((item) => (
            <li key={item.title} className="min-w-0">
              <item.icon
                className="h-5 w-5 text-mf-accent"
                strokeWidth={1.75}
                aria-hidden
              />
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/75">{item.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/fut/organizadores#registro"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mf-brand transition hover:bg-white/90"
          >
            Ver registro gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
