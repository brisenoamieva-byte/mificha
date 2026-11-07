import Link from "next/link";

const TYPES = [
  {
    id: "tutor",
    title: "Ficha del tutor",
    status: "Piloto gratis",
    detail:
      "Fotos, videos e historia que armas tú. Sirve para visorías, universidades y clubes.",
    href: "/fut/tutor",
    cta: "Entrar como tutor",
    live: true,
  },
  {
    id: "torneo",
    title: "Ficha de torneo",
    status: "En desarrollo",
    detail:
      "Stats oficiales después del partido. Se verán en tu cuenta de tutor cuando la academia publique la jornada.",
    href: "/fut/tutor",
    cta: "Crear cuenta de tutor",
    live: false,
  },
  {
    id: "gph",
    title: "Informe GPH",
    status: "Disponible",
    detail:
      "Diagnóstico del evaluador (técnica, físico, mental). Se agenda y se paga aparte.",
    href: "/fut/evaluaciones",
    cta: "Ver evaluaciones",
    live: true,
  },
] as const;

export function FichaTypesSection() {
  return (
    <section id="tipos-de-ficha" className="scroll-mt-24 border-b border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
          Cómo leer MiFicha
        </p>
        <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-mf-gph-ink sm:text-3xl">
          Tres cosas distintas, un mismo expediente
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          Ficha del tutor, stats de torneo e informe GPH. Si tu hijo ya está en un plantel,
          en el espacio de tutor puedes ligarlo con su academia.
        </p>

        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {TYPES.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-xl border border-mf-border bg-white px-5 py-5"
            >
              <span
                className={
                  item.live
                    ? "w-fit rounded-full bg-mf-gph px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                    : "w-fit rounded-full bg-mf-canvas px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted"
                }
              >
                {item.status}
              </span>
              <h3 className="mt-3 text-base font-semibold text-mf-gph-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-mf-text-secondary">{item.detail}</p>
              <Link
                href={item.href}
                className={item.live ? "mf-btn-gph mt-4 self-start" : "mf-btn-gph-ghost mt-4 self-start"}
              >
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
