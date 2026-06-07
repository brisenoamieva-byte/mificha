import { BadgeCheck, TrendingUp } from "lucide-react";
import { getPassportCircleStyles } from "@/lib/player-utils";
import { cn } from "@/lib/utils";

const PREVIEW_SCORE = 78;

function PreviewPassportScore({ score }: { score: number }) {
  const styles = getPassportCircleStyles(score);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-medium uppercase tracking-wide text-mf-text-muted">
        Passport Score
      </p>
      <div
        className={cn(
          "relative mt-3 flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full",
          styles.bg,
        )}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={styles.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <p className={cn("text-3xl font-bold tabular-nums", styles.text)}>{score}</p>
      </div>
    </div>
  );
}

export function HomeFichaPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-2xl bg-mf-brand/[0.06] blur-2xl"
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
          <PreviewPassportScore score={PREVIEW_SCORE} />

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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mf-success-soft px-3 py-1 text-xs font-semibold text-mf-success">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verificada por academia
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mf-brand-soft px-3 py-1 text-xs font-semibold text-mf-brand">
              <TrendingUp className="h-3.5 w-3.5" />
              +6 esta semana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
