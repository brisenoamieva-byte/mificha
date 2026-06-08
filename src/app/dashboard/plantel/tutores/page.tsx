import type { Metadata } from "next";
import { PlantelGuardiansContent } from "@/components/dashboard/plantel-guardians-content";

export const metadata: Metadata = {
  title: "Avisos a tutores | MiFicha",
  description:
    "Envía el link de la ficha por email o WhatsApp. Sin imprimir QR.",
};

export default function PlantelTutoresPage() {
  return <PlantelGuardiansContent />;
}
