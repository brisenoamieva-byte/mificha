import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Busca gratis",
    detail:
      "Cualquiera filtra por nombre, posición y lugar. Ves datos básicos del directorio.",
  },
  {
    n: "2",
    title: "Publica tu ficha",
    detail:
      "Tutor o representante arma la ficha del jugador y decide si aparece en Explorar (opt-in).",
  },
  {
    n: "3",
    title: "Detalle y academia",
    detail:
      "Con Explorar Pro ves ficha completa (gratis). La academia usa plantel y partidos; el diagnóstico GPH es aparte.",
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Cómo funciona</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink sm:text-2xl">
            Tres pasos
          </h2>
        </div>

        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Paso {step.n}
              </p>
              <h3 className="mt-2 text-base font-semibold text-mf-gph-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-mf-text-secondary">{step.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link href="/fut/entrar" className="mf-btn-gph w-full justify-center sm:w-auto">
            Entrar / publicar ficha
          </Link>
          <Link
            href="/fut/explorar#pro"
            className="mf-btn-gph-ghost w-full justify-center sm:w-auto"
          >
            Ver membresía
          </Link>
        </div>
      </div>
    </section>
  );
}
