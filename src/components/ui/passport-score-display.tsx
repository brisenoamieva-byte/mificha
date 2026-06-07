import {
  clampPassportScore,
  getPassportFilledSegments,
  getPassportTier,
} from "@/lib/passport-score";
import { cn } from "@/lib/utils";

interface PassportScoreDisplayProps {
  score: number;
  variant?: "hero" | "card" | "compact" | "inline";
  showLabel?: boolean;
  showTier?: boolean;
  className?: string;
}

export function PassportSegments({
  score,
  className,
  segmentClassName,
}: {
  score: number;
  className?: string;
  segmentClassName?: string;
}) {
  const tier = getPassportTier(score);
  const filled = getPassportFilledSegments(score);

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 flex-1 skew-x-[-12deg] rounded-[2px]",
            index < filled ? tier.segmentFilled : tier.segmentEmpty,
            segmentClassName,
          )}
        />
      ))}
    </div>
  );
}

export function PassportScoreDisplay({
  score,
  variant = "hero",
  showLabel = true,
  showTier = true,
  className,
}: PassportScoreDisplayProps) {
  const value = clampPassportScore(score);
  const tier = getPassportTier(value);

  if (variant === "inline") {
    const filled = getPassportFilledSegments(value);
    return (
      <div className={cn("flex min-w-[88px] items-center gap-2", className)}>
        <div className="flex flex-1 gap-0.5">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 skew-x-[-12deg] rounded-[1px]",
                index < filled ? tier.segmentFilled : "bg-slate-200",
              )}
            />
          ))}
        </div>
        <span className="w-7 text-right text-xs font-bold tabular-nums text-slate-700">
          {value}
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border px-3 py-2 text-center shadow-sm",
          tier.panelBg,
          tier.panelBorder,
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_45%)]" />
        {showTier ? (
          <span
            className={cn(
              "relative inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]",
              tier.badgeBg,
              tier.badgeText,
            )}
          >
            {tier.label}
          </span>
        ) : null}
        <p
          className={cn(
            "relative mt-1 text-2xl font-black italic tabular-nums leading-none tracking-tight",
            tier.scoreText,
          )}
        >
          {value}
        </p>
        {showLabel ? (
          <p className="relative mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Passport
          </p>
        ) : null}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 p-4 shadow-lg",
          tier.panelBg,
          tier.panelBorder,
          className,
        )}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rotate-12 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_8px)]" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            {showTier ? (
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]",
                  tier.badgeBg,
                  tier.badgeText,
                )}
              >
                {tier.label}
              </span>
            ) : null}
            <p
              className={cn(
                "mt-2 text-5xl font-black italic tabular-nums leading-none tracking-tight drop-shadow-sm",
                tier.scoreText,
              )}
            >
              {value}
            </p>
            {showLabel ? (
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                Passport Score
              </p>
            ) : null}
          </div>
          <div
            className="flex h-16 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20"
            style={{ clipPath: "polygon(50% 0%, 100% 22%, 100% 78%, 50% 100%, 0% 78%, 0% 22%)" }}
          >
            <span className={cn("text-xl font-black italic tabular-nums", tier.scoreText)}>
              {value}
            </span>
          </div>
        </div>
        <PassportSegments score={value} className="relative mt-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border-2 p-5 shadow-xl",
        tier.panelBg,
        tier.panelBorder,
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-8 top-0 h-full w-16 skew-x-[-18deg] bg-white/5" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_2px,transparent_2px,transparent_10px)]" />

      <div className="relative text-center">
        {showTier ? (
          <span
            className={cn(
              "inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em]",
              tier.badgeBg,
              tier.badgeText,
            )}
          >
            {tier.label}
          </span>
        ) : null}

        <div className="relative mx-auto mt-3 flex h-24 w-20 items-center justify-center">
          <div
            className="absolute inset-0 border-2 border-white/15 bg-black/25 shadow-inner"
            style={{ clipPath: "polygon(50% 0%, 100% 24%, 100% 76%, 50% 100%, 0% 76%, 0% 24%)" }}
          />
          <span
            className={cn(
              "relative text-4xl font-black italic tabular-nums leading-none tracking-tight drop-shadow-md",
              tier.scoreText,
            )}
          >
            {value}
          </span>
        </div>

        {showLabel ? (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
            Passport Score
          </p>
        ) : null}

        <PassportSegments score={value} className="relative mt-4 px-1" />
      </div>
    </div>
  );
}
