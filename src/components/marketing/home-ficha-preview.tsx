import { BadgeCheck, TrendingUp } from "lucide-react";
import { PassportScoreDisplay } from "@/components/ui/passport-score-display";

const PREVIEW_SCORE = 78;

export function HomeFichaPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-2xl bg-[radial-gradient(circle,rgba(52,211,153,0.12)_0%,rgba(27,79,140,0.06)_55%,transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-mf-border bg-mf-surface shadow-[0_24px_48px_-12px_rgba(15,45,82,0.18)]">
        <div className="border-b border-mf-border-subtle bg-gradient-to-r from-mf-brand to-mf-brand-dark px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Ficha verificada
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">
            Santiago Hernández
          </p>
          <p className="text-sm text-white/75">Delantero · Sub-15 · Academia Gallos</p>
        </div>

        <div className="px-5 py-6">
          <PassportScoreDisplay
            score={PREVIEW_SCORE}
            variant="hero"
            scoreLabel="Progreso verificado"
          />

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Partidos", value: "12" },
              { label: "Goles", value: "9" },
              { label: "Asist.", value: "4" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-mf-border-subtle bg-mf-canvas px-3 py-3 text-center"
              >
                <p className="text-xl font-semibold tabular-nums text-mf-text">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-mf-text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="mf-badge-accent">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verificada por academia
            </span>
            <span className="mf-badge-brand">
              <TrendingUp className="h-3.5 w-3.5" />
              Activo esta semana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
