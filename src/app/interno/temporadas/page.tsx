import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { SeasonsAdminPanel } from "@/components/interno/seasons-admin-panel";

export default function InternoTemporadasPage() {
  return (
    <InternoAccessGate
      nextPath="/interno/temporadas"
      loadingLabel="Cargando temporadas…"
    >
      <SeasonsAdminPanel />
    </InternoAccessGate>
  );
}
