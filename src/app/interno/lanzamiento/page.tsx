import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { FounderLaunchPlaybook } from "@/components/interno/founder-launch-playbook";

export default function FounderLaunchPage() {
  return (
    <InternoAccessGate
      nextPath="/interno/lanzamiento"
      loadingLabel="Cargando playbook…"
    >
      <FounderLaunchPlaybook />
    </InternoAccessGate>
  );
}
