import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { TournamentsAdminPanel } from "@/components/interno/tournaments-admin-panel";

export default function InternoTorneosPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/torneos"
      loadingLabel="Cargando torneos…"
    >
      <TournamentsAdminPanel />
    </InternoAccessGate>
  );
}
