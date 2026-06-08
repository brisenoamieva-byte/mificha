import { cn } from "@/lib/utils";
import {
  getAchievementDefinition,
  RARITY_STYLES,
  type AchievementRarity,
} from "@/lib/player-achievements";

interface AchievementBadgeProps {
  achievementKey: string;
  title?: string;
  description?: string;
  rarity?: AchievementRarity;
  emoji?: string;
  compact?: boolean;
  highlight?: boolean;
  className?: string;
}

export function AchievementBadge({
  achievementKey,
  title,
  description,
  rarity,
  emoji,
  compact = false,
  highlight = false,
  className,
}: AchievementBadgeProps) {
  const definition = getAchievementDefinition(achievementKey);
  const resolvedTitle = title ?? definition?.title ?? achievementKey;
  const resolvedDescription = description ?? definition?.description;
  const resolvedRarity = rarity ?? definition?.rarity ?? "common";
  const resolvedEmoji = emoji ?? definition?.emoji ?? "🏅";
  const styles = RARITY_STYLES[resolvedRarity];

  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3 text-left transition",
        styles.border,
        styles.bg,
        highlight && `shadow-lg ${styles.glow}`,
        compact ? "py-2" : "py-3",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("text-2xl leading-none", compact && "text-xl")}>{resolvedEmoji}</span>
        <div className="min-w-0">
          <p className={cn("font-semibold", styles.text, compact ? "text-sm" : "text-base")}>
            {resolvedTitle}
          </p>
          {!compact && resolvedDescription ? (
            <p className="mt-1 text-xs leading-5 text-slate-600">{resolvedDescription}</p>
          ) : null}
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {resolvedRarity === "epic"
              ? "Épico"
              : resolvedRarity === "rare"
                ? "Raro"
                : "Común"}
          </p>
        </div>
      </div>
    </div>
  );
}
