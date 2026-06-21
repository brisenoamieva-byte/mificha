import type { RadarSeries } from "@/lib/player-visual-profile";
import { cn } from "@/lib/utils";

interface ProfileRadarChartProps {
  axes: readonly string[];
  series: RadarSeries[];
  className?: string;
  size?: number;
}

function polarPoint(
  center: number,
  radius: number,
  index: number,
  total: number,
  value: number,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = (value / 10) * radius;
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance,
  };
}

function buildPolygonPoints(
  center: number,
  radius: number,
  values: number[],
  axes: readonly string[],
) {
  return values
    .map((value, index) => {
      const point = polarPoint(center, radius, index, axes.length, value);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function ProfileRadarChart({
  axes,
  series,
  className,
  size = 220,
}: ProfileRadarChartProps) {
  const center = size / 2;
  const radius = size * 0.34;
  const rings = [2, 4, 6, 8, 10];

  return (
    <div className={cn("mx-auto", className)} style={{ maxWidth: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full">
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={buildPolygonPoints(
              center,
              radius,
              Array.from({ length: axes.length }, () => ring),
              axes,
            )}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.08}
            className="text-slate-400"
          />
        ))}

        {axes.map((label, index) => {
          const outer = polarPoint(center, radius, index, axes.length, 10);
          const labelPoint = polarPoint(center, radius + 18, index, axes.length, 10);
          return (
            <g key={label}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeOpacity={0.1}
                className="text-slate-400"
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500 text-[9px] font-medium"
              >
                {label}
              </text>
            </g>
          );
        })}

        {series.map((item) => (
          <g key={item.label}>
            <polygon
              points={buildPolygonPoints(center, radius, item.values, axes)}
              fill={item.color}
              fillOpacity={item.fillOpacity ?? 0.2}
              stroke={item.color}
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {series.map((item) => (
          <div key={item.label} className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
