import type { Metadata } from "next";
import { FamilyOrdersAdmin } from "@/components/pay/family-orders-admin";
import { PartnershipAccessGate } from "@/components/interno/partnership-access-gate";

export const metadata: Metadata = {
  title: "Ganancias | MiFicha",
  robots: { index: false, follow: false },
};

export default function DashboardCobrosPage() {
  return (
    <PartnershipAccessGate
      nextPath="/fut/dashboard/cobros"
      loadingLabel="Verificando acceso de socios…"
    >
      <FamilyOrdersAdmin />
    </PartnershipAccessGate>
  );
}
