import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GphEvaluationBadge } from "@/components/ui/gph-evaluation-badge";
import {
  DIAGNOSIS_KIND_LABELS,
  DIAGNOSIS_STAGE_LABELS,
  formatDiagnosisDate,
} from "@/lib/player-diagnosis";
import type { PublicGphSummary } from "@/lib/gph-player-link";

type GphPublicStripProps = {
  summary: PublicGphSummary;
  href: string;
};

export function GphPublicStrip({ summary, href }: GphPublicStripProps) {
  const stage = summary.stage ? DIAGNOSIS_STAGE_LABELS[summary.stage] : null;
  const score =
    summary.globalScore != null ? summary.globalScore.toFixed(1) : null;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-mf-gph/25 bg-mf-gph-soft/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <GphEvaluationBadge asSpan />
          <p className="text-sm font-semibold text-mf-gph-ink">
            {DIAGNOSIS_KIND_LABELS[summary.kind]}
          </p>
        </div>
        <p className="mt-1 text-xs text-mf-text-secondary">
          {formatDiagnosisDate(summary.evaluatedAt)}
          {stage ? ` · ${stage}` : ""}
          {score ? ` · índice ${score}` : ""}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mf-gph px-4 py-2 text-sm font-semibold text-white hover:bg-[#d63a00]"
      >
        Ver evaluación
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
