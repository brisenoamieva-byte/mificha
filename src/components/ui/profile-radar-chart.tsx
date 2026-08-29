import type { RadarSeries } from "@/lib/player-visual-profile";
import { cn } from "@/lib/utils";

interface ProfileRadarChartProps {
  axes: readonly string[];
  series: RadarSeries[];
  className?: string;
  size?: number;
  /** Escala máxima del radar. Diagnóstico GPH usa 5; perfil visual usa 10. */
  maxValue?: number;
  /** Etiquetas en el SVG; por defecto usa `axes`. */
  axisChartLabels?: readonly string[];
  /** Espacio reducido: tabla de valores debajo con nombres completos. */
  compact?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
}

function polarPoint(
  center: number,
  radius: number,
  index: number,
  total: number,
  value: number,
  maxValue: number,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = (value / maxValue) * radius;
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
  maxValue: number,
) {
  return values
    .map((value, index) => {
      const point = polarPoint(center, radius, index, axes.length, value, maxValue);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function axisLabelAlignment(index: number, total: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);

  if (sin < -0.55) {
    return { textAnchor: "middle" as const, dx: 0, dy: -4 };
  }
  if (sin > 0.55) {
    return { textAnchor: "middle" as const, dx: 0, dy: 5 };
  }
  if (cos > 0) {
    return { textAnchor: "start" as const, dx: 5, dy: 3 };
  }
  return { textAnchor: "end" as const, dx: -5, dy: 3 };
}

function formatRadarValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function ProfileRadarChart({
  axes,
  series,
  className,
  size = 220,
  maxValue = 10,
  axisChartLabels,
  compact = false,
  showLegend = true,
  showValues = true,
}: ProfileRadarChartProps) {
  const pad = compact ? 22 : 30;
  const chartRadius = size * (compact ? 0.3 : 0.32);
  const viewSize = size + pad * 2;
  const center = viewSize / 2;
  const labelRadius = chartRadius + (compact ? 13 : 17);
  const rings = maxValue <= 5 ? [1, 2, 3, 4, 5] : [2, 4, 6, 8, 10];
  const primary = series[0];
  const chartLabels = axisChartLabels ?? axes;
  const showVertexValues = showValues && !compact;

  return (
    <div className={cn("mx-auto w-full", className)} style={{ maxWidth: viewSize }}>
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Gráfica radar: ${axes.join(", ")}`}
      >
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={buildPolygonPoints(
              center,
              chartRadius,
              Array.from({ length: axes.length }, () => ring),
              axes,
              maxValue,
            )}
            fill="none"
            stroke="currentColor"
            strokeOpacity={ring === maxValue ? 0.14 : 0.07}
            className="text-slate-400"
          />
        ))}

        {chartLabels.map((label, index) => {
          const outer = polarPoint(center, chartRadius, index, axes.length, maxValue, maxValue);
          const labelPoint = polarPoint(center, labelRadius, index, axes.length, maxValue, maxValue);
          const align = axisLabelAlignment(index, axes.length);

          return (
            <g key={`${label}-${index}`}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeOpacity={0.12}
                className="text-slate-400"
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={align.textAnchor}
                dominantBaseline="middle"
                dx={align.dx}
                dy={align.dy}
                className={cn(
                  "fill-slate-600 font-medium",
                  compact ? "text-[8px]" : "text-[10px]",
                )}
              >
                {label}
              </text>
            </g>
          );
        })}

        {series.map((item) => (
          <g key={item.label}>
            <polygon
              points={buildPolygonPoints(center, chartRadius, item.values, axes, maxValue)}
              fill={item.color}
              fillOpacity={item.fillOpacity ?? 0.22}
              stroke={item.color}
              strokeWidth={1.75}
              strokeLinejoin="round"
            />
            {showVertexValues
              ? item.values.map((value, index) => {
                  const point = polarPoint(center, chartRadius, index, axes.length, value, maxValue);
                  return (
                    <g key={`${item.label}-${index}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={compact ? 2.2 : 2.8}
                        fill="white"
                        stroke={item.color}
                        strokeWidth={1.25}
                      />
                      <text
                        x={point.x}
                        y={point.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={cn(
                          "font-semibold",
                          compact ? "text-[6.5px]" : "text-[8px]",
                        )}
                        fill={item.color}
                      >
                        {formatRadarValue(value)}
                      </text>
                    </g>
                  );
                })
              : null}
          </g>
        ))}

        <circle cx={center} cy={center} r={1.5} fill="currentColor" className="text-slate-300" />
      </svg>

      {compact && primary ? (
        <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-mf-border-subtle pt-1.5">
          {axes.map((label, index) => (
            <div key={label} className="flex items-baseline justify-between gap-1">
              <dt className="truncate text-[9px] text-mf-text-muted">{label}</dt>
              <dd className="shrink-0 text-[9px] font-semibold tabular-nums text-mf-brand">
                {formatRadarValue(primary.values[index] ?? 0)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {showLegend && !compact ? (
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
      ) : null}
    </div>
  );
}
