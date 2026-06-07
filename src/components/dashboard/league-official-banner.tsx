import { ExternalLink } from "lucide-react";
import type { Academy } from "@/types/database";

interface LeagueOfficialBannerProps {
  academy: Pick<Academy, "league_name" | "league_calendar_url">;
  compact?: boolean;
}

export function LeagueOfficialBanner({ academy, compact }: LeagueOfficialBannerProps) {
  if (!academy.league_calendar_url?.trim()) return null;

  const leagueLabel = academy.league_name?.trim() || "Liga oficial";

  if (compact) {
    return (
      <a
        href={academy.league_calendar_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4F8C] hover:underline"
      >
        {leagueLabel}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-[#1B4F8C]/20 bg-[#1B4F8C]/5 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{leagueLabel}</p>
        <p className="mt-1 text-sm text-slate-600">
          Calendario y clasificación oficial de tu competición. MiFicha complementa con
          stats individuales del plantel.
        </p>
      </div>
      <a
        href={academy.league_calendar_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4F8C] ring-1 ring-[#1B4F8C]/20 transition hover:bg-[#1B4F8C]/5 sm:mt-0"
      >
        Ver calendario oficial
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
