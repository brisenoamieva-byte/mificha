"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import type { PlayerPosition } from "@/types/database";
import { cn } from "@/lib/utils";

const POSITION_OPTIONS: { value: PlayerPosition | "all"; label: string }[] = [
  { value: "all", label: "Todas las posiciones" },
  { value: "goalkeeper", label: "Portero" },
  { value: "defender", label: "Defensa" },
  { value: "midfielder", label: "Mediocampista" },
  { value: "forward", label: "Delantero" },
];

function buildExploreHref(input: {
  query: string;
  position: PlayerPosition | "all";
  state: string;
  city: string;
}) {
  const params = new URLSearchParams();
  if (input.query.trim()) params.set("q", input.query.trim());
  if (input.position !== "all") params.set("position", input.position);
  if (input.state) params.set("state", input.state);
  if (input.city) params.set("city", input.city);
  const qs = params.toString();
  return qs ? `/fut/explorar?${qs}#directorio` : "/fut/explorar#directorio";
}

export function HomePlayerSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<PlayerPosition | "all">("all");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(buildExploreHref({ query, position, state, city }));
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-white/15 bg-white/95 p-3 shadow-[0_24px_60px_-28px_rgba(8,24,48,0.55)] backdrop-blur sm:p-4",
        className,
      )}
    >
      <label className="block">
        <span className="sr-only">Buscar jugador</span>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mf-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, código MF-, academia o ciudad"
            className="mf-input h-12 border-mf-border bg-white pl-11 text-base"
            autoComplete="off"
          />
        </div>
      </label>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_auto]">
        <label className="block">
          <span className="sr-only">Posición</span>
          <select
            value={position}
            onChange={(event) =>
              setPosition(event.target.value as PlayerPosition | "all")
            }
            className="mf-input"
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <MexicoLocationSelect
          allowAll
          hideLabels
          state={state}
          city={city}
          onStateChange={(next) => {
            setState(next);
            if (!next) setCity("");
          }}
          onCityChange={setCity}
          className="gap-2"
          selectClassName="mf-input"
        />

        <button type="submit" className="mf-btn-gph h-[42px] justify-center sm:col-span-2 lg:col-span-1">
          Buscar
        </button>
      </div>
    </form>
  );
}
