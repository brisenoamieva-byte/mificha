import type { Metadata } from "next";
import { Suspense } from "react";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { MarsSponsorOnePagerView } from "@/components/interno/mars-sponsor-one-pager-view";

export const metadata: Metadata = {
  title: "Patrocinio Mars | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function PatrocinioMarsPage() {
  return (
    <InternoAccessGate
      nextPath="/interno/patrocinio-mars"
      loadingLabel="Cargando propuesta Mars…"
    >
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <MarsSponsorOnePagerView />
      </Suspense>
    </InternoAccessGate>
  );
}
