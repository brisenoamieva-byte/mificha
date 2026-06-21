"use client";

import { useId } from "react";
import { getPositionLabel } from "@/lib/dashboard-utils";
import { POSITION_FIELD_ZONES } from "@/lib/player-visual-profile";
import type { PlayerPosition } from "@/types/database";
import { cn } from "@/lib/utils";

/** Proporciones FIFA: 68 m (ancho) × 105 m (largo), portería arriba = ataque. */
const PITCH_W = 68;
const PITCH_L = 105;
const PENALTY_DEPTH = 16.5;
const PENALTY_WIDTH = 40.32;
const GOAL_AREA_DEPTH = 5.5;
const GOAL_AREA_WIDTH = 18.32;
const CENTER_CIRCLE_R = 9.15;
const PENALTY_SPOT = 11;
const PENALTY_ARC_R = 9.15;
const LINE = 0.55;

const penaltyArcHalfWidth = Math.sqrt(PENALTY_ARC_R ** 2 - (PENALTY_DEPTH - PENALTY_SPOT) ** 2);

interface PositionFieldMarkProps {
  primary: PlayerPosition;
  secondary?: PlayerPosition | null;
  className?: string;
  compact?: boolean;
}

function SoccerPitchSvg({ gradientId }: { gradientId: string }) {
  const padX = (PITCH_W - PENALTY_WIDTH) / 2;
  const goalX = (PITCH_W - GOAL_AREA_WIDTH) / 2;
  const midY = PITCH_L / 2;
  const inset = LINE / 2;

  const lineProps = {
    fill: "none" as const,
    stroke: "rgba(255,255,255,0.88)",
    strokeWidth: LINE,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      viewBox={`0 0 ${PITCH_W} ${PITCH_L}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3da858" />
          <stop offset="100%" stopColor="#2a7a42" />
        </linearGradient>
      </defs>

      <rect width={PITCH_W} height={PITCH_L} fill={`url(#${gradientId})`} />

      {/* Franjas de césped */}
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={(PITCH_W / 10) * i}
          y={0}
          width={PITCH_W / 10}
          height={PITCH_L}
          fill={i % 2 === 0 ? "rgba(0,0,0,0.045)" : "transparent"}
        />
      ))}

      {/* Líneas de banda */}
      <rect
        x={inset}
        y={inset}
        width={PITCH_W - LINE}
        height={PITCH_L - LINE}
        {...lineProps}
      />

      {/* Medio campo */}
      <line x1={inset} y1={midY} x2={PITCH_W - inset} y2={midY} {...lineProps} />

      {/* Círculo central */}
      <circle cx={PITCH_W / 2} cy={midY} r={CENTER_CIRCLE_R} {...lineProps} />
      <circle cx={PITCH_W / 2} cy={midY} r={0.55} fill="rgba(255,255,255,0.9)" />

      {/* Área grande — arriba (portería rival) */}
      <rect x={padX} y={inset} width={PENALTY_WIDTH} height={PENALTY_DEPTH} {...lineProps} />
      {/* Área chica — arriba */}
      <rect
        x={goalX}
        y={inset}
        width={GOAL_AREA_WIDTH}
        height={GOAL_AREA_DEPTH}
        {...lineProps}
      />

      {/* Área grande — abajo (portería propia) */}
      <rect
        x={padX}
        y={PITCH_L - PENALTY_DEPTH - inset}
        width={PENALTY_WIDTH}
        height={PENALTY_DEPTH}
        {...lineProps}
      />
      {/* Área chica — abajo */}
      <rect
        x={goalX}
        y={PITCH_L - GOAL_AREA_DEPTH - inset}
        width={GOAL_AREA_WIDTH}
        height={GOAL_AREA_DEPTH}
        {...lineProps}
      />

      {/* Punto penal */}
      <circle cx={PITCH_W / 2} cy={PENALTY_SPOT} r={0.55} fill="rgba(255,255,255,0.9)" />
      <circle
        cx={PITCH_W / 2}
        cy={PITCH_L - PENALTY_SPOT}
        r={0.55}
        fill="rgba(255,255,255,0.9)"
      />

      {/* Arco penal superior */}
      <path
        d={`M ${PITCH_W / 2 - penaltyArcHalfWidth} ${PENALTY_DEPTH + inset} A ${PENALTY_ARC_R} ${PENALTY_ARC_R} 0 0 0 ${PITCH_W / 2 + penaltyArcHalfWidth} ${PENALTY_DEPTH + inset}`}
        {...lineProps}
      />
      {/* Arco penal inferior */}
      <path
        d={`M ${PITCH_W / 2 - penaltyArcHalfWidth} ${PITCH_L - PENALTY_DEPTH - inset} A ${PENALTY_ARC_R} ${PENALTY_ARC_R} 0 0 1 ${PITCH_W / 2 + penaltyArcHalfWidth} ${PITCH_L - PENALTY_DEPTH - inset}`}
        {...lineProps}
      />
    </svg>
  );
}

export function PositionFieldMark({
  primary,
  secondary,
  className,
  compact = false,
}: PositionFieldMarkProps) {
  const gradientId = useId().replace(/:/g, "");
  const marks = [
    { position: primary, tone: "primary" as const },
    ...(secondary && secondary !== primary
      ? [{ position: secondary, tone: "secondary" as const }]
      : []),
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-emerald-900/25 shadow-inner",
          compact ? "aspect-[68/105] w-[92px]" : "aspect-[68/105] w-full max-w-[136px]",
        )}
      >
        <SoccerPitchSvg gradientId={`pitch-grass-${gradientId}`} />

        {marks.map((mark) => {
          const zone = POSITION_FIELD_ZONES[mark.position];
          return (
            <div
              key={`${mark.position}-${mark.tone}`}
              className={cn(
                "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.35)]",
                compact ? "h-6 w-6 text-[8px]" : "h-8 w-8 text-[10px]",
                mark.tone === "primary"
                  ? "border-white bg-[#1B4F8C]"
                  : "border-white bg-amber-500",
              )}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              title={getPositionLabel(mark.position)}
            >
              {zone.label}
            </div>
          );
        })}
      </div>

      <div className={cn("space-y-0.5 text-mf-text-secondary", compact ? "text-[10px]" : "text-xs")}>
        <p>
          <span className="font-semibold text-mf-text">Principal:</span>{" "}
          {getPositionLabel(primary)}
        </p>
        {secondary && secondary !== primary ? (
          <p>
            <span className="font-semibold text-mf-text">Alternativa:</span>{" "}
            {getPositionLabel(secondary)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
