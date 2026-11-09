import Link from "next/link";
import type { PublicCodeResolution } from "@/lib/public-code-resolve";
import {
  PLAYER_CODE_EYEBROW,
  PLAYER_CODE_HEADLINE,
} from "@/lib/player-public-code-copy";

export function PublicCodeStub({ resolution }: { resolution: PublicCodeResolution }) {
  const name =
    resolution.tutor?.playerName ||
    resolution.player?.displayName ||
    resolution.visoria?.playerName ||
    "Jugador";
  const code = resolution.code;

  return (
    <article className="overflow-hidden rounded-2xl border border-mf-border bg-white shadow-[var(--mf-shadow)]">
      <div className="bg-gradient-to-br from-[#0a1f3d] via-[#123d68] to-[#0f2d52] px-5 py-7 text-white sm:px-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mf-accent-bright">
          {PLAYER_CODE_EYEBROW}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{name}</h1>
        {code ? (
          <p className="mt-2 font-mono text-lg font-semibold tracking-wide text-mf-accent-bright">
            {code}
          </p>
        ) : null}
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/75">
          {PLAYER_CODE_HEADLINE} Completa la ficha del tutor para sumar foto, historia y
          material presentable.
        </p>
      </div>
      <div className="space-y-3 px-5 py-5 sm:px-7">
        {resolution.visoria ? (
          <p className="text-sm leading-7 text-mf-text-secondary">
            Registrado en{" "}
            <Link
              href={resolution.visoria.eventPath}
              className="font-semibold text-mf-gph hover:underline"
            >
              {resolution.visoria.eventTitle}
            </Link>
            {resolution.visoria.folio ? ` · folio ${resolution.visoria.folio}` : ""}.
          </p>
        ) : null}
        {resolution.player ? (
          <p className="text-sm leading-7 text-mf-text-secondary">
            Hay vínculo con academia
            {resolution.player.academyName ? ` · ${resolution.player.academyName}` : ""}.
            {resolution.player.isPublicFicha && resolution.player.slug ? (
              <>
                {" "}
                <Link
                  href={`/fut/j/${resolution.player.slug}`}
                  className="font-semibold text-mf-gph hover:underline"
                >
                  Ver ficha de torneo
                </Link>
                .
              </>
            ) : (
              " Cuando activen consentimiento, aquí aparecerá la ficha oficial."
            )}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/fut/tutor" className="mf-btn-gph">
            Completar ficha tutor
          </Link>
          {resolution.visoria ? (
            <Link href={resolution.visoria.eventPath} className="mf-btn-gph-ghost">
              Ir a visorías
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
