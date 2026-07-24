import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { FixturesAdminPanel } from "@/components/interno/fixtures-admin-panel";

export default function InternoJornadasPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/jornadas"
      loadingLabel="Cargando jornadas…"
    >
      <FixturesAdminPanel />
    </InternoAccessGate>
  );
}
