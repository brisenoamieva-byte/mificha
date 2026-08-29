import type { Metadata } from "next";
import { DiagnosisList } from "@/components/diagnosis/diagnosis-list";

export const metadata: Metadata = {
  title: "Diagnósticos | MiFicha",
  description: "Evaluación 1–5 por jugador y ficha visual de resultados.",
};

export default function DiagnosticoPage() {
  return <DiagnosisList />;
}
