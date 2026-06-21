import { MessageCircle, UserRound } from "lucide-react";
import { getAudienceById } from "@/lib/audience-value-props";

const AUDIENCES = [
  { id: "padres" as const, icon: MessageCircle },
  { id: "jugadores" as const, icon: UserRound },
];

export function PadresBenefitsSection() {
  return (
    <section className="border-b border-mf-border bg-mf-canvas">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Qué obtienes</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text sm:text-3xl">
            Para padres y jugadores
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary">
            Misma ficha, distinto uso: el tutor consulta el avance; el jugador comparte su
            historial en visorías o becas.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {AUDIENCES.map(({ id, icon: Icon }) => {
            const audience = getAudienceById(id);
            if (!audience) return null;

            return (
              <article key={id} className="mf-card p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mf-accent-soft text-mf-accent-dark">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-mf-text">{audience.title}</h3>
                    <p className="mt-1 text-sm font-medium text-mf-text">{audience.headline}</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 border-t border-mf-border-subtle pt-4">
                  {audience.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex gap-2 text-sm leading-6 text-mf-text-secondary"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mf-brand/60" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
