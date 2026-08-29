import { cn } from "@/lib/utils";

interface DiagnosisScoreRingProps {
  score: number | null;
  size?: number;
  className?: string;
  tone?: "default" | "gph";
}

export function DiagnosisScoreRing({
  score,
  size = 148,
  className,
  tone = "default",
}: DiagnosisScoreRingProps) {
  const max = 5;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score == null ? 0 : Math.min(1, score / max);
  const offset = circumference * (1 - progress);
  const gph = tone === "gph";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={gph ? "text-mf-gph-muted" : "text-mf-brand-soft"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={gph ? "text-mf-gph" : "text-mf-accent-dark"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p
          className={cn(
            "text-4xl font-semibold tabular-nums leading-none",
            gph ? "text-mf-gph-ink" : "text-mf-brand-dark",
          )}
        >
          {score == null ? "—" : score.toFixed(1)}
        </p>
        <p
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted",
          )}
        >
          Índice / 5
        </p>
      </div>
    </div>
  );
}
