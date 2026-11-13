import type { Metadata } from "next";
import { Suspense } from "react";
import { GphInviteWavePanel } from "@/components/interno/gph-invite-wave-panel";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";

export const metadata: Metadata = {
  title: "Ola GPH | MiFicha interno",
  robots: { index: false, follow: false, nocache: true },
};

export default function GphOlaInternoPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/gph-ola"
      loadingLabel="Cargando ola GPH…"
    >
      <Suspense fallback={<div className="min-h-screen bg-mf-canvas" />}>
        <div className="min-h-dvh bg-mf-canvas">
          <GphInviteWavePanel />
        </div>
      </Suspense>
    </InternoAccessGate>
  );
}
