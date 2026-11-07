import Link from "next/link";

const ACCOUNTS = [
  {
    id: "tutor",
    title: "Cuenta de tutor (papá/mamá)",
    forWho: "Familias",
    status: "Piloto gratis",
    canDo: [
      "Dar de alta a tu hijo y armar su ficha (fotos, videos, historia)",
      "Compartir un link presentable para visorías o universidades",
      "Ligar al hijo con su academia si ya está en un plantel",
    ],
    notFor: "No es el panel de la academia ni el de Ganancias.",
    href: "/fut/tutor",
    cta: "Entrar como tutor",
    primary: true,
  },
  {
    id: "academia",
    title: "Cuenta de academia",
    forWho: "Colegios y clubes",
    status: "Activa",
    canDo: [
      "Registrar plantel, partidos y avisos a tutores",
      "Dar de alta jugadores del club (no sustituye la ficha del papá)",
      "Staff y dueño operan el día a día del torneo",
    ],
    notFor: "No sirve para armar la ficha familiar del piloto.",
    href: "/fut/signup",
    cta: "Registrar academia",
    primary: false,
  },
  {
    id: "gph",
    title: "Evaluador / GPH",
    forWho: "Gustavo y staff autorizado",
    status: "Privado",
    canDo: [
      "Crear y ver diagnósticos reales",
      "Administrar visorías y el ledger de ganancias",
    ],
    notFor: "No es una cuenta pública de familia.",
    href: "/fut/evaluaciones",
    cta: "Ver evaluaciones",
    primary: false,
  },
  {
    id: "link",
    title: "Solo con un link",
    forWho: "Padres con ficha de torneo",
    status: "Sin cuenta",
    canDo: [
      "Abrir la ficha post-partido si la academia ya envió el enlace",
      "No hace falta registrarse como tutor para ver ese link",
    ],
    notFor: "Sin link no hay acceso a stats de torneo todavía.",
    href: "/fut/padres#abrir-ficha",
    cta: "Abrir con link",
    primary: false,
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
          Qué cuenta necesitas
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mf-text-secondary">
          No es lo mismo ser papá, academia o evaluador. El mismo correo puede usarse en
          más de un rol, pero cada entrada abre un panel distinto.
        </p>

        <ul className="mt-8 grid gap-3 lg:grid-cols-2">
          {ACCOUNTS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-xl border border-mf-border bg-mf-canvas px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    item.primary
                      ? "rounded-full bg-mf-gph px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                      : "rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mf-text-muted"
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
              <p className="mt-3 text-xs leading-5 text-mf-text-muted">{item.notFor}</p>
              <Link
                href={item.href}
                className={
                  item.primary ? "mf-btn-gph mt-4 self-start" : "mf-btn-gph-ghost mt-4 self-start"
                }
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
