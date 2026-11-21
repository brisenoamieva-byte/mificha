"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Flame } from "lucide-react";
import type { TalentGeoHeat } from "@/lib/talent-geo";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

type ExploreTalentMapProps = {
  heat: TalentGeoHeat;
  selectedState?: string;
  selectedCity?: string;
  onSelectLocation: (next: { state: string; city: string }) => void;
};

export function ExploreTalentMap({
  heat,
  selectedState = "",
  selectedCity = "",
  onSelectLocation,
}: ExploreTalentMapProps) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const maxCity = useMemo(
    () => Math.max(1, ...heat.cities.map((c) => c.count)),
    [heat.cities],
  );
  const topCities = useMemo(() => heat.cities.slice(0, 8), [heat.cities]);

  useEffect(() => {
    let cancelled = false;

    async function mountMap() {
      if (!mapNodeRef.current || mapRef.current) return;
      try {
        const L = (await import("leaflet")).default;

        if (cancelled || !mapNodeRef.current) return;

        const map = L.map(mapNodeRef.current, {
          zoomControl: false,
          attributionControl: true,
          scrollWheelZoom: false,
        }).setView([23.6, -102.5], 5);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Esri Dark Gray — sin API key (CartoCDN ahora exige apikey).
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
            maxZoom: 16,
          },
        ).addTo(map);

        const layer = L.layerGroup().addTo(map);
        mapRef.current = map;
        layerRef.current = layer;
        setReady(true);
      } catch {
        if (!cancelled) setMapError(true);
      }
    }

    void mountMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !layerRef.current) return;

    let cancelled = false;

    async function draw() {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || !layerRef.current) return;

      layerRef.current.clearLayers();

      for (const bucket of heat.cities) {
        const intensity = bucket.count / maxCity;
        const isSelected =
          selectedState === bucket.state &&
          (!selectedCity || selectedCity === bucket.city);
        const radius = 8 + intensity * 28;

        const circle = L.circleMarker([bucket.lat, bucket.lng], {
          radius,
          color: isSelected ? "#fbbf24" : "#34d399",
          weight: isSelected ? 2.5 : 1,
          fillColor: isSelected
            ? "#f59e0b"
            : `rgba(52, 211, 153, ${0.25 + intensity * 0.55})`,
          fillOpacity: 0.85,
          opacity: 0.95,
        });

        circle.bindTooltip(
          `<strong>${bucket.city}</strong><br/>${bucket.state} · ${bucket.count} ficha${bucket.count === 1 ? "" : "s"}`,
          { direction: "top", opacity: 0.95 },
        );

        circle.on("click", () => {
          onSelectLocation({ state: bucket.state, city: bucket.city });
        });

        circle.addTo(layerRef.current!);
      }

      if (heat.cities.length > 0) {
        const bounds = L.latLngBounds(
          heat.cities.map((c) => [c.lat, c.lng] as [number, number]),
        );
        mapRef.current.fitBounds(bounds.pad(0.35), { maxZoom: 7 });
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [
    ready,
    heat.cities,
    maxCity,
    selectedState,
    selectedCity,
    onSelectLocation,
  ]);

  return (
    <section
      id="mapa"
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-mf-border bg-[#0b1220] shadow-[0_18px_40px_rgba(15,45,82,0.12)]"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            Mapa de talento
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            De dónde son las fichas en MiFicha
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
            Calor agregado por ciudad (sin nombres ni códigos). El mapa cuenta todas
            las fichas; el directorio de abajo solo muestra las que el tutor autorizó
            publicar. Toca un punto para filtrar.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[280px]">
          <StatChip
            label="Fichas"
            value={String(heat.totalFichas)}
            hint="en roster"
          />
          <StatChip
            label="Con lugar"
            value={String(heat.totalWithLocation)}
            hint="ciudad/edo"
          />
          <StatChip
            label="Estados"
            value={String(heat.stateCount)}
            hint="con talento"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px]">
        <div className="relative min-h-[320px] sm:min-h-[380px]">
          {mapError ? (
            <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center text-sm text-slate-400">
              No se pudo cargar el mapa. Usa la lista de ciudades a la derecha.
            </div>
          ) : (
            <div ref={mapNodeRef} className="absolute inset-0 z-0 h-full w-full" />
          )}
          <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-black/55 px-2.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm">
            Más brillante = más fichas
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#0d1526] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Top ciudades
            </p>
            {(selectedState || selectedCity) && (
              <button
                type="button"
                onClick={() => onSelectLocation({ state: "", city: "" })}
                className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
              >
                Limpiar
              </button>
            )}
          </div>
          <ul className="max-h-[320px] space-y-1 overflow-y-auto px-2 pb-3 sm:max-h-[380px]">
            {topCities.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-slate-500">
                Aún no hay ubicaciones suficientes.
              </li>
            ) : (
              topCities.map((bucket) => {
                const active =
                  selectedState === bucket.state &&
                  (!selectedCity || selectedCity === bucket.city);
                return (
                  <li key={`${bucket.state}-${bucket.city}`}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectLocation({
                          state: bucket.state,
                          city: bucket.city,
                        })
                      }
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-emerald-400/15 text-white ring-1 ring-emerald-400/40"
                          : "text-slate-300 hover:bg-white/5",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-amber-300" : "text-emerald-400/80",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {bucket.city}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {bucket.state}
                        </span>
                      </span>
                      <span className="tabular-nums text-sm font-semibold text-white">
                        {bucket.count}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{hint}</p>
    </div>
  );
}
