import {
  clampPassportScore,
  getPassportTier,
} from "@/lib/passport-score";
import { cn } from "@/lib/utils";

interface PassportScoreDisplayProps {
  score: number;
  variant?: "hero" | "card" | "compact" | "inline";
  surface?: "light" | "dark";
  showLabel?: boolean;
  showTier?: boolean;
  /** Player-facing copy; default keeps product name for coaches */
  scoreLabel?: string;
  className?: string;
}

function PassportProgressBar({
  score,
  className,
  surface = "light",
  barClassName,
}: {
  score: number;
  className?: string;
  surface?: "light" | "dark";
  barClassName?: string;
}) {
  const value = clampPassportScore(score);
  const tier = getPassportTier(value);

  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden rounded-full",
        surface === "dark" ? "bg-white/15" : "bg-slate-100",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          surface === "dark" ? tier.progressFillOnDark : tier.progressFill,
          barClassName,
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function PassportSegments({
  score,
  className,
  surface = "light",
}: {
  score: number;
  className?: string;
  surface?: "light" | "dark";
  /** @deprecated No longer used — kept for call-site compatibility */
  segmentClassName?: string;
}) {
  return (
    <PassportProgressBar
      score={score}
      surface={surface}
      className={cn("h-1.5", className)}
    />
  );
}

export function PassportScoreDisplay({
  score,
  variant = "hero",
  surface = "light",
  showLabel = true,
  showTier = true,
  scoreLabel = "Passport Score",
  className,
}: PassportScoreDisplayProps) {
  const value = clampPassportScore(score);
  const tier = getPassportTier(value);
  const scoreColor = surface === "dark" ? tier.scoreTextOnDark : tier.scoreText;
  const labelColor =
    surface === "dark" ? "text-white/55" : "text-slate-400";
  const tierColor =
    surface === "dark" ? "text-white/50" : "text-slate-500";

  if (variant === "inline") {
    return (
      <div className={cn("flex min-w-[88px] items-center gap-2.5", className)}>
        <PassportProgressBar score={value} surface={surface} className="flex-1" />
        <span
          className={cn(
            "w-7 shrink-0 text-right text-xs font-semibold tabular-nums",
            surface === "dark" ? "text-white/90" : "text-slate-700",
          )}
        >
          {value}
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border px-3 py-2.5 text-center",
          surface === "dark"
            ? "border-white/10 bg-white/5"
            : "border-slate-200/80 bg-white shadow-sm",
          className,
        )}
      >
        {showTier ? (
          <p className={cn("text-[10px] font-medium tracking-wide", tierColor)}>
            {tier.label}
          </p>
        ) : null}
        <p
          className={cn(
            "font-semibold tabular-nums leading-none tracking-tight",
            showTier ? "mt-1 text-2xl" : "text-xl",
            scoreColor,
          )}
        >
          {value}
        </p>
        {showLabel ? (
          <p className={cn("mt-1 text-[9px] font-medium", labelColor)}>
            {scoreLabel}
          </p>
        ) : null}
        {showLabel || showTier ? (
          <PassportProgressBar
            score={value}
            surface={surface}
            className="mt-2"
          />
        ) : null}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "rounded-2xl border p-4",
          surface === "dark"
            ? "border-white/10 bg-white/5"
            : "border-slate-200/80 bg-white shadow-sm",
          className,
        )}
      >
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {showTier ? (
              <p className={cn("text-[11px] font-medium", tierColor)}>
                {tier.label}
              </p>
            ) : null}
            <p
              className={cn(
                "mt-1 text-5xl font-semibold tabular-nums leading-none tracking-tight",
                scoreColor,
              )}
            >
              {value}
            </p>
            {showLabel ? (
              <p className={cn("mt-2 text-xs font-medium", labelColor)}>
                {scoreLabel}
              </p>
            ) : null}
          </div>
        </div>
        <PassportProgressBar score={value} surface={surface} className="mt-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[200px] rounded-2xl border px-5 py-6 text-center",
        surface === "dark"
          ? "border-white/10 bg-white/5"
          : "border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      {showTier ? (
        <p className={cn("text-[11px] font-medium tracking-wide", tierColor)}>
          {tier.label}
        </p>
      ) : null}

      <p
        className={cn(
          "font-semibold tabular-nums leading-none tracking-tight",
          showTier ? "mt-2 text-5xl" : "text-5xl",
          scoreColor,
        )}
      >
        {value}
      </p>

      {showLabel ? (
        <p className={cn("mt-2 text-xs font-medium", labelColor)}>
          {scoreLabel}
        </p>
      ) : null}

      <PassportProgressBar score={value} surface={surface} className="mt-4" />
    </div>
  );
}
