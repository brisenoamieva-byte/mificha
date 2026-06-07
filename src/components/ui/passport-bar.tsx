import { PassportScoreDisplay } from "@/components/ui/passport-score-display";

interface PassportBarProps {
  score: number;
  className?: string;
}

export function PassportBar({ score, className }: PassportBarProps) {
  return <PassportScoreDisplay score={score} variant="inline" className={className} />;
}
