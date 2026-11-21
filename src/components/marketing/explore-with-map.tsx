"use client";

import { useCallback, useState } from "react";
import { ExploreDirectory } from "@/components/marketing/explore-directory";
import { ExploreTalentMap } from "@/components/marketing/explore-talent-map";
import type { PublicDirectoryData } from "@/lib/public-directory";
import type { TalentGeoHeat } from "@/lib/talent-geo";

type ExploreWithMapProps = {
  data: PublicDirectoryData;
  heat: TalentGeoHeat;
  initialCategoryFilter?: string;
  unlocked?: boolean;
  initialQuery?: string;
  initialPosition?: string;
  initialState?: string;
  initialCity?: string;
};

export function ExploreWithMap({
  data,
  heat,
  initialCategoryFilter,
  unlocked,
  initialQuery,
  initialPosition,
  initialState = "",
  initialCity = "",
}: ExploreWithMapProps) {
  const [location, setLocation] = useState({
    state: initialState,
    city: initialCity,
  });

  const onLocationChange = useCallback((next: { state: string; city: string }) => {
    setLocation(next);
  }, []);

  const onMapSelect = useCallback((next: { state: string; city: string }) => {
    setLocation(next);
    if (typeof document !== "undefined" && (next.state || next.city)) {
      window.setTimeout(() => {
        document
          .getElementById("directorio")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, []);

  return (
    <div className="space-y-8">
      <ExploreTalentMap
        heat={heat}
        selectedState={location.state}
        selectedCity={location.city}
        onSelectLocation={onMapSelect}
      />
      <div id="directorio" className="scroll-mt-20">
        <ExploreDirectory
          data={data}
          initialCategoryFilter={initialCategoryFilter}
          unlocked={unlocked}
          initialQuery={initialQuery}
          initialPosition={initialPosition}
          locationState={location.state}
          locationCity={location.city}
          onLocationChange={onLocationChange}
        />
      </div>
    </div>
  );
}
