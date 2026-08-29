import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { GphPartnerPanel } from "@/components/interno/gph-partner-panel";

export default function InternoGphPage() {
  return (
    <InternoAccessGate nextPath="/fut/interno/gph" loadingLabel="Cargando acceso GPH…">
      <GphPartnerPanel />
    </InternoAccessGate>
  );
}
