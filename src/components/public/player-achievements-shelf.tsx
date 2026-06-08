import { Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/ui/achievement-badge";

import type { PublicPlayerAchievement } from "@/lib/public-player";

interface PlayerAchievementsShelfProps {
  achievements: PublicPlayerAchievement[];
}

export function PlayerAchievementsShelf({ achievements }: PlayerAchievementsShelfProps) {
  if (achievements.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-100 px-6 py-8 sm:px-10">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">Insignias verificadas</h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Logros desbloqueados con stats oficiales capturadas por la academia.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={`${achievement.achievement_key}-${achievement.unlocked_at}`}
            achievementKey={achievement.achievement_key}
            compact
          />
        ))}
      </div>
    </section>
  );
}
