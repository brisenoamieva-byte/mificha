import { PositionFieldMark } from "@/components/ui/position-field-mark";
import { FICHA_COPY } from "@/lib/ficha-content";
import { TRAIT_LABELS, type PlayerCoachTraits } from "@/lib/player-visual-profile";
import type { PlayerPosition } from "@/types/database";
import { cn } from "@/lib/utils";

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="truncate font-medium text-mf-text-secondary">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-mf-brand">{value}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-mf-brand"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

interface FichaCoachBlockProps {
  primary: PlayerPosition;
  secondary?: PlayerPosition | null;
  traits: {
    technical: number | null;
    tactical: number | null;
    physical: number | null;
    attitude: number | null;
  };
  coachNotes?: string | null;
  className?: string;
}

export function FichaCoachBlock({
  primary,
  secondary,
  traits,
  coachNotes,
  className,
}: FichaCoachBlockProps) {
  const hasTraits = Object.values(traits).some((value) => value != null);
  const hasNotes = Boolean(coachNotes?.trim());

  if (!hasTraits && !hasNotes && !secondary) {
    return null;
  }

  const traitEntries = [
    { key: "technical", label: TRAIT_LABELS.technical, value: traits.technical },
    { key: "tactical", label: TRAIT_LABELS.tactical, value: traits.tactical },
    { key: "physical", label: TRAIT_LABELS.physical, value: traits.physical },
    { key: "attitude", label: TRAIT_LABELS.attitude, value: traits.attitude },
  ].filter((item) => item.value != null) as Array<{ key: string; label: string; value: number }>;

  return (
    <section className={cn("border-b border-mf-border-subtle px-4 py-3 sm:px-5", className)}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mf-text-muted">
        {FICHA_COPY.coachEval}
      </p>
      <p className="mt-0.5 text-[10px] leading-4 text-mf-text-muted">{FICHA_COPY.coachEvalHint}</p>

      <div className="mt-2 grid gap-3 sm:grid-cols-[92px_1fr] sm:items-start">
        <div className="flex justify-center sm:justify-start">
          <PositionFieldMark primary={primary} secondary={secondary} compact className="!space-y-1.5" />
        </div>

        {traitEntries.length > 0 ? (
          <div className="grid gap-2">
            {traitEntries.map((item) => (
              <TraitBar key={item.key} label={item.label} value={item.value} />
            ))}
          </div>
        ) : null}
      </div>

      {hasNotes ? (
        <p className="mt-3 text-xs leading-5 text-mf-text-secondary">{coachNotes}</p>
      ) : null}
    </section>
  );
}

export function hasFichaCoachContent(
  player: PlayerCoachTraits & { position: PlayerPosition },
): boolean {
  return Boolean(
    player.coach_notes?.trim() ||
      player.trait_technical ||
      player.trait_tactical ||
      player.trait_physical ||
      player.trait_attitude ||
      player.secondary_position,
  );
}
