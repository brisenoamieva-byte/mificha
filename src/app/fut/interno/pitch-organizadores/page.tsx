import type { Metadata } from "next";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { PitchDeckView } from "@/components/interno/pitch-deck-view";
import { ORGANIZER_PITCH_SLIDES } from "@/lib/organizer-pitch-deck";

export const metadata: Metadata = {
  title: "Pitch organizadores | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function OrganizerPitchDeckPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/pitch-organizadores"
      loadingLabel="Cargando pitch organizadores…"
    >
      <PitchDeckView
        slides={ORGANIZER_PITCH_SLIDES}
        backHref="/fut/organizadores/presentacion"
        backLabel="Versión web"
      />
    </InternoAccessGate>
  );
}
