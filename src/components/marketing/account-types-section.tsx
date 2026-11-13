import Link from "next/link";
import { SCOUT_PRODUCT } from "@/lib/scout-product";

const ACCOUNTS = [
  {
    id: "persona",
    title: "Tutor o representante",
    forWho: "Persona",
    status: `${SCOUT_PRODUCT.priceLabel} ${SCOUT_PRODUCT.currency}/${SCOUT_PRODUCT.period.replace("al ", "")}`,
    canDo: [
      "Llenar fichas de hijos o representados y llevar seguimiento",
      "Con consentimiento, aparecer en el buscador",
      "Desbloquear detalle de otros jugadores (Explorar Pro incluido)",
      "Mismo espacio para tutor o representante",
    ],
    href: "/fut/entrar",
    cta: "Entrar / crear cuenta",
    primary: true,
  },
  {
    id: "academia",
    title: "Academia",
    forWho: "Colegios y clubes",
    status: "Gratis",
    canDo: [
      "Registrar plantel, partidos y avisos a tutores",
      "Operar el día a día del torneo con staff",
    ],
    href: "/fut/signup",
    cta: "Registrar academia",
    primary: false,
  },
] as const;

const LAYERS = [
  {
    title: "Ficha del jugador",
    detail: "Fotos, videos e historia; la arma el tutor o el representante.",
  },
  {
    title: "Directorio Explorar",
    detail: "Con opt-in, la ficha aparece en el buscador para scouts y clubes.",
  },
  {
    title: "Informe GPH",
    detail: "Diagnóstico del evaluador (cuando lo contratan).",
  },
] as const;

export function AccountTypesSection() {
  return (
    <section id="tipos-de-cuenta" className="scroll-mt-24 border-b border-mf-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Accesos
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-3xl">
          Dos cuentas
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Persona ($50 USD/año) o academia (gratis).
        </p>

        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {ACCOUNTS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-xl border border-mf-border bg-mf-canvas px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    item.primary
                      ? "rounded-md bg-mf-gph px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                      : "rounded-md bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted"
                  }
                >
                  {item.status}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                  {item.forWho}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-mf-gph-ink">{item.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-mf-text-secondary">
                {item.canDo.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
              <Link
                href={item.href}
                className={
                  item.primary
                    ? "mf-btn-gph mt-4 self-start"
                    : "mf-btn-gph-ghost mt-4 self-start"
                }
              >
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid gap-3 border-t border-mf-border-subtle pt-6 md:grid-cols-3">
          {LAYERS.map((item) => (
            <li key={item.title} className="min-w-0">
              <p className="text-sm font-semibold text-mf-gph-ink">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
