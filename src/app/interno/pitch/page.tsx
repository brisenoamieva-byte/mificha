import type { Metadata } from "next";
import { PitchDeckGate } from "@/components/interno/pitch-deck-gate";

export const metadata: Metadata = {
  title: "Pitch deck | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function PitchDeckPage() {
  return <PitchDeckGate />;
}
