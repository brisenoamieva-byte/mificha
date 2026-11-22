import Link from "next/link";
import { FOUNDER_BADGE_HINT, FOUNDER_BADGE_LABEL, MISION_PATH } from "@/lib/mision";
import { cn } from "@/lib/utils";

export function FounderBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-950",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
        {FOUNDER_BADGE_LABEL}
      </p>
      {compact ? null : (
        <p className="mt-1 text-sm leading-6 text-emerald-900/85">
          {FOUNDER_BADGE_HINT}{" "}
          <Link href={MISION_PATH} className="font-semibold underline">
            Ver la misión
          </Link>
        </p>
      )}
    </div>
  );
}
