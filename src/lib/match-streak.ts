const STREAK_MAX_GAP_DAYS = 21;

export function computeConsecutiveMatchStreak(matchDates: string[]): number {
  const dates = [...matchDates]
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (dates.length === 0) return 0;

  let streak = 1;

  for (let index = 0; index < dates.length - 1; index += 1) {
    const current = new Date(dates[index]);
    const older = new Date(dates[index + 1]);
    const diffDays = (current.getTime() - older.getTime()) / 86_400_000;

    if (diffDays <= STREAK_MAX_GAP_DAYS) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function getStreakLabel(streak: number) {
  if (streak >= 3) {
    return `${streak} partidos seguidos`;
  }

  if (streak === 2) {
    return "2 partidos seguidos";
  }

  return null;
}
