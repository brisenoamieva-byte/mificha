import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { DataGovernancePlaybook } from "@/components/interno/data-governance-playbook";

export default function GobernanzaPage() {
  return (
    <InternoAccessGate
      nextPath="/fut/interno/gobernanza"
      loadingLabel="Cargando modelo de datos…"
    >
      <DataGovernancePlaybook />
    </InternoAccessGate>
  );
}
