import type { Metadata } from "next";
import { PartnershipAccessGate } from "@/components/interno/partnership-access-gate";
import { PartnershipAccountsPanel } from "@/components/interno/partnership-accounts-panel";
import { PARTNERSHIP_HUB_PATH } from "@/lib/partnership-access";

export const metadata: Metadata = {
  title: "Socios · cuentas | MiFicha",
  robots: { index: false, follow: false },
};

export default function InternoSociosPage() {
  return (
    <PartnershipAccessGate
      nextPath={PARTNERSHIP_HUB_PATH}
      loadingLabel="Verificando acceso de socios…"
    >
      <main className="min-h-dvh bg-mf-canvas">
        <PartnershipAccountsPanel />
      </main>
    </PartnershipAccessGate>
  );
}
