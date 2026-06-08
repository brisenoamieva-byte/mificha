import Link from "next/link";
import { Share2, Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import { buildAchievementShareUrl } from "@/lib/share-ficha";

import type { PublicPlayerAchievement } from "@/lib/public-player";

interface PlayerAchievementsShelfProps {
  slug: string;
  achievements: PublicPlayerAchievement[];
}

export function PlayerAchievementsShelf({
  slug,
  achievements,
}: PlayerAchievementsShelfProps) {
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
        Logros desbloqueados con stats oficiales. Toca una insignia para compartir su tarjeta.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <Link
            key={`${achievement.achievement_key}-${achievement.unlocked_at}`}
            href={buildAchievementShareUrl(slug, achievement.achievement_key)}
            className="group block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <AchievementBadge
              achievementKey={achievement.achievement_key}
              compact
              className="group-hover:ring-2 group-hover:ring-amber-200"
            />
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 opacity-0 transition group-hover:opacity-100">
              <Share2 className="h-3 w-3" />
              Compartir tarjeta
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
