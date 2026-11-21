import type { Metadata } from "next";
import { GrowthFunnelPanel } from "@/components/interno/growth-funnel-panel";
import { PartnershipAccessGate } from "@/components/interno/partnership-access-gate";

export const metadata: Metadata = {
  title: "Embudo viral | MiFicha",
  robots: { index: false, follow: false },
};

export default function InternoEmbudoPage() {
  return (
    <PartnershipAccessGate
      nextPath="/fut/interno/embudo"
      loadingLabel="Verificando acceso…"
    >
      <main className="min-h-dvh bg-mf-canvas">
        <GrowthFunnelPanel />
      </main>
    </PartnershipAccessGate>
  );
}
