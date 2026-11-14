import type { Metadata } from "next";
import { Suspense } from "react";
import { GphInviteWavePanel } from "@/components/interno/gph-invite-wave-panel";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { PilotInviteCrmPanel } from "@/components/interno/pilot-invite-crm-panel";

export const metadata: Metadata = {
  title: "Ola piloto | MiFicha interno",
  robots: { index: false, follow: false, nocache: true },
};

export default function GphOlaInternoPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/gph-ola"
      loadingLabel="Cargando ola piloto…"
    >
      <Suspense fallback={<div className="min-h-screen bg-mf-canvas" />}>
        <div className="min-h-dvh bg-mf-canvas">
          <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
            <PilotInviteCrmPanel />
            <div className="border-t border-mf-border pt-10">
              <GphInviteWavePanel embedded />
            </div>
          </div>
        </div>
      </Suspense>
    </InternoAccessGate>
  );
}
