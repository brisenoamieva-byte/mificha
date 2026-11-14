import type { Metadata } from "next";
import { OrganizerPitchDeckGate } from "@/components/interno/organizer-pitch-deck-gate";

export const metadata: Metadata = {
  title: "Pitch organizadores | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function OrganizerPitchDeckPage() {
  return <OrganizerPitchDeckGate />;
}
