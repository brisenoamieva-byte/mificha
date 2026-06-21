import { PassportScoreDisplay } from "@/components/ui/passport-score-display";

interface PassportBarProps {
  score: number;
  className?: string;
  showScore?: boolean;
}

export function PassportBar({ score, className, showScore = false }: PassportBarProps) {
  return (
    <PassportScoreDisplay
      score={score}
      variant="inline"
      showScore={showScore}
      showLabel={false}
      className={className}
    />
  );
}
