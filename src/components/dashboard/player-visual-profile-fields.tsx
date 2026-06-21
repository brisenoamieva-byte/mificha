"use client";

import { positionOptions } from "@/lib/player-utils";
import {
  COACH_NOTES_MAX_LENGTH,
  TRAIT_LABELS,
} from "@/lib/player-visual-profile";
import type { PlayerPosition } from "@/types/database";
import { TraitSlider } from "@/components/ui/trait-slider";

interface PlayerVisualProfileFieldsProps {
  secondaryPosition: PlayerPosition | "";
  onSecondaryPositionChange: (value: PlayerPosition | "") => void;
  traitTechnical: number | null;
  onTraitTechnicalChange: (value: number | null) => void;
  traitTactical: number | null;
  onTraitTacticalChange: (value: number | null) => void;
  traitPhysical: number | null;
  onTraitPhysicalChange: (value: number | null) => void;
  traitAttitude: number | null;
  onTraitAttitudeChange: (value: number | null) => void;
  coachNotes: string;
  onCoachNotesChange: (value: string) => void;
}

const selectClassName =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20";

export function PlayerVisualProfileFields({
  secondaryPosition,
  onSecondaryPositionChange,
  traitTechnical,
  onTraitTechnicalChange,
  traitTactical,
  onTraitTacticalChange,
  traitPhysical,
  onTraitPhysicalChange,
  traitAttitude,
  onTraitAttitudeChange,
  coachNotes,
  onCoachNotesChange,
}: PlayerVisualProfileFieldsProps) {
  return (
    <div className="rounded-xl border border-[#1B4F8C]/15 bg-[#1B4F8C]/5 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Perfil visual del entrenador</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Evaluación de la academia — no verificada por el acta del torneo. Ayuda a scouts
          y padres a entender el perfil del jugador.
        </p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700">
          Posición alternativa
        </label>
        <select
          value={secondaryPosition}
          onChange={(event) =>
            onSecondaryPositionChange(event.target.value as PlayerPosition | "")
          }
          className={selectClassName}
        >
          <option value="">Sin alternativa</option>
          {positionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TraitSlider
          label={TRAIT_LABELS.technical}
          value={traitTechnical}
          onChange={onTraitTechnicalChange}
        />
        <TraitSlider
          label={TRAIT_LABELS.tactical}
          value={traitTactical}
          onChange={onTraitTacticalChange}
        />
        <TraitSlider
          label={TRAIT_LABELS.physical}
          value={traitPhysical}
          onChange={onTraitPhysicalChange}
        />
        <TraitSlider
          label={TRAIT_LABELS.attitude}
          value={traitAttitude}
          onChange={onTraitAttitudeChange}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700">
          Observaciones del cuerpo técnico
        </label>
        <textarea
          value={coachNotes}
          maxLength={COACH_NOTES_MAX_LENGTH}
          rows={3}
          onChange={(event) => onCoachNotesChange(event.target.value)}
          placeholder="Ej. Buena visión de juego, mejora pase largo..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {coachNotes.length}/{COACH_NOTES_MAX_LENGTH}
        </p>
      </div>
    </div>
  );
}
