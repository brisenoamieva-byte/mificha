import Link from "next/link";
import type { PublicCodeResolution } from "@/lib/public-code-resolve";
import {
  PLAYER_CODE_EYEBROW,
  PLAYER_CODE_SHORT,
} from "@/lib/player-public-code-copy";
import { cn } from "@/lib/utils";

export function PlayerCodeConnections({
  resolution,
  className,
}: {
  resolution: PublicCodeResolution;
  className?: string;
}) {
  const code = resolution.code;
  const nodes = [
    {
      key: "ficha",
      label: "Ficha tutor",
      detail: resolution.tutor
        ? "Material e historia"
        : "Aún sin ficha del tutor",
      href: resolution.tutor ? null : "/fut/tutor",
      active: Boolean(resolution.tutor),
    },
    {
      key: "academia",
      label: "Academia",
      detail: resolution.player
        ? resolution.player.academyName || "Plantel ligado"
        : "Sin academia ligada",
      href:
        resolution.player?.isPublicFicha && resolution.player.slug
          ? `/fut/j/${resolution.player.slug}`
          : null,
      active: Boolean(resolution.player),
    },
    {
      key: "visoria",
      label: "Visoría",
      detail: resolution.visoria
        ? resolution.visoria.eventTitle
        : "Sin registro de visoría",
      href: resolution.visoria?.eventPath ?? null,
      active: Boolean(resolution.visoria),
    },
  ] as const;

  const activeCount = nodes.filter((node) => node.active).length;

  return (
    <section
      className={cn(
        "rounded-2xl border border-mf-border bg-white px-4 py-4 sm:px-5 print:hidden",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
            {PLAYER_CODE_EYEBROW}
          </p>
          <p className="mt-1 text-sm text-mf-text-secondary">
            {code ? (
              <>
                <span className="font-mono font-semibold text-mf-gph-ink">{code}</span>
                {" · "}
              </>
            ) : null}
            {PLAYER_CODE_SHORT}
          </p>
          <p className="mt-1 text-xs text-mf-text-muted">
            {activeCount} conexión{activeCount === 1 ? "" : "es"} activa
            {activeCount === 1 ? "" : "s"} ahora · ficha, academia y visoría usan el mismo
            número.
          </p>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {nodes.map((node) => (
          <li
            key={node.key}
            className={cn(
              "rounded-xl border px-3 py-3",
              node.active
                ? "border-mf-gph/30 bg-mf-gph-soft/60"
                : "border-dashed border-mf-border bg-mf-canvas/60",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
              {node.label}
            </p>
            <p className="mt-1 text-sm font-medium text-mf-gph-ink">{node.detail}</p>
            {node.href ? (
              <Link
                href={node.href}
                className="mt-2 inline-block text-sm font-semibold text-mf-gph hover:underline"
              >
                {node.active ? "Abrir" : "Completar"}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
