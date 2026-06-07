"use client";

import { useEffect, useMemo } from "react";
import {
  getMunicipalitiesForState,
  MEXICO_STATES,
  resolveMunicipalityName,
  resolveStateName,
} from "@/lib/mexico-locations";
import { cn } from "@/lib/utils";

interface MexicoLocationSelectProps {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  statePlaceholder?: string;
  cityPlaceholder?: string;
  className?: string;
  selectClassName?: string;
  required?: boolean;
  allowAll?: boolean;
  allStateLabel?: string;
  allCityLabel?: string;
  showCity?: boolean;
}

export function MexicoLocationSelect({
  state,
  city,
  onStateChange,
  onCityChange,
  stateLabel = "Estado",
  cityLabel = "Ciudad o municipio",
  statePlaceholder = "Selecciona un estado",
  cityPlaceholder = "Selecciona un municipio",
  className,
  selectClassName,
  required = false,
  allowAll = false,
  allStateLabel = "Todos los estados",
  allCityLabel = "Todos los municipios",
  showCity = true,
}: MexicoLocationSelectProps) {
  const municipalities = useMemo(
    () => (state ? getMunicipalitiesForState(state) : []),
    [state],
  );

  useEffect(() => {
    if (!state) {
      if (city) onCityChange("");
      return;
    }

    if (city && !municipalities.some((municipality) => municipality === city)) {
      const resolved = resolveMunicipalityName(state, city);
      if (resolved && resolved !== city) {
        onCityChange(resolved);
      }
    }
  }, [state, city, municipalities, onCityChange]);

  function handleStateChange(nextState: string) {
    onStateChange(nextState);
    if (!nextState) {
      onCityChange("");
      return;
    }

    onCityChange(resolveMunicipalityName(nextState, city));
  }

  return (
    <div className={cn(showCity ? "grid gap-4 sm:grid-cols-2" : "", className)}>
      <label className="block">
        <span className="text-sm font-medium text-mf-text">{stateLabel}</span>
        <select
          value={state}
          required={required}
          onChange={(event) => handleStateChange(event.target.value)}
          className={cn("mf-input mt-2", selectClassName)}
        >
          {allowAll ? <option value="">{allStateLabel}</option> : null}
          {!allowAll ? (
            <option value="" disabled>
              {statePlaceholder}
            </option>
          ) : null}
          {MEXICO_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {showCity ? (
        <label className="block">
        <span className="text-sm font-medium text-mf-text">{cityLabel}</span>
        <select
          value={city}
          required={required && Boolean(state)}
          disabled={!state}
          onChange={(event) => onCityChange(event.target.value)}
          className={cn(
            "mf-input mt-2 disabled:cursor-not-allowed disabled:bg-mf-canvas disabled:text-mf-text-muted",
            selectClassName,
          )}
        >
          {allowAll ? (
            <option value="">{state ? allCityLabel : "Primero elige un estado"}</option>
          ) : (
            <option value="" disabled={!state}>
              {state ? cityPlaceholder : "Primero elige un estado"}
            </option>
          )}
          {municipalities.map((municipality) => (
            <option key={municipality} value={municipality}>
              {municipality}
            </option>
          ))}
        </select>
      </label>
      ) : null}
    </div>
  );
}

export function useResolvedMexicoLocation(state: string, city: string) {
  return useMemo(
    () => ({
      state: resolveStateName(state) || state,
      city: resolveMunicipalityName(resolveStateName(state) || state, city) || city,
    }),
    [state, city],
  );
}
