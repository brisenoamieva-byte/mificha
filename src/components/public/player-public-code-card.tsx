import Link from "next/link";
import { Copy } from "lucide-react";
import {
  PLAYER_CODE_BULLETS,
  PLAYER_CODE_EYEBROW,
  PLAYER_CODE_HEADLINE,
  PLAYER_CODE_LABEL,
  PLAYER_CODE_SHORT,
  PLAYER_CODE_TIP,
} from "@/lib/player-public-code-copy";
import { tutorSharePath } from "@/lib/tutor-family";
import { cn } from "@/lib/utils";

type Variant = "card" | "compact" | "inline";

export function PlayerPublicCodeCard({
  code,
  variant = "card",
  onCopy,
  copied = false,
  showOpenLink = true,
  className,
}: {
  code: string;
  variant?: Variant;
  onCopy?: () => void;
  copied?: boolean;
  showOpenLink?: boolean;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={cn("text-sm leading-6 text-mf-text-secondary", className)}>
        <span className="font-semibold text-mf-gph-ink">{PLAYER_CODE_LABEL}</span>
        {" · "}
        <span className="font-mono font-semibold tracking-wide text-mf-gph">{code}</span>
        {" · "}
        {PLAYER_CODE_SHORT}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-mf-border bg-white px-4 py-3",
          className,
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
          {PLAYER_CODE_EYEBROW}
        </p>
        <p className="mt-1 font-mono text-xl font-bold tracking-wide text-mf-gph-ink">
          {code}
        </p>
        <p className="mt-1 text-sm leading-6 text-mf-text-secondary">{PLAYER_CODE_SHORT}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-mf-gph/25 bg-white px-4 py-4 sm:px-5",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
        {PLAYER_CODE_EYEBROW}
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-wide text-mf-gph-ink">
        {code}
      </p>
      <p className="mt-2 text-sm font-semibold text-mf-gph-ink">{PLAYER_CODE_LABEL}</p>
      <p className="mt-1 text-sm leading-7 text-mf-text-secondary">{PLAYER_CODE_HEADLINE}</p>
      <ul className="mt-3 space-y-1.5">
        {PLAYER_CODE_BULLETS.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-mf-text-secondary">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mf-gph" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-5 text-mf-text-muted">{PLAYER_CODE_TIP}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {onCopy ? (
          <button type="button" className="mf-btn-gph-ghost" onClick={onCopy}>
            <Copy className="h-4 w-4" />
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        ) : null}
        {showOpenLink ? (
          <Link href={tutorSharePath(code)} className="mf-btn-gph-ghost" target="_blank">
            Ver ficha del código
          </Link>
        ) : null}
      </div>
    </div>
  );
}
