import { ShieldCheck } from "lucide-react";
import { buildAcademyRosterMinutesNotice } from "@/lib/match-data-governance";
import { cn } from "@/lib/utils";

interface OfficialMatchNoticeProps {
  variant?: "info" | "warning" | "success";
  title?: string;
  message?: string;
  className?: string;
}

export function OfficialMatchNotice({
  variant = "info",
  title,
  message = buildAcademyRosterMinutesNotice(),
  className,
}: OfficialMatchNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 sm:px-5",
        variant === "info" && "border-[#1B4F8C]/20 bg-[#1B4F8C]/5",
        variant === "warning" && "border-amber-200 bg-amber-50",
        variant === "success" && "border-emerald-200 bg-emerald-50",
        className,
      )}
    >
      <p
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
          variant === "info" && "text-[#1B4F8C]",
          variant === "warning" && "text-amber-800",
          variant === "success" && "text-emerald-800",
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        {title ?? "Jornada oficial MiFicha"}
      </p>
      <p
        className={cn(
          "mt-2 text-sm leading-6",
          variant === "info" && "text-slate-700",
          variant === "warning" && "text-amber-950",
          variant === "success" && "text-emerald-950",
        )}
      >
        {message}
      </p>
    </div>
  );
}
