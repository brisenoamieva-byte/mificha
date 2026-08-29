import type { Metadata } from "next";
import { DiagnosisViewContent } from "@/components/diagnosis/diagnosis-view-content";

export const metadata: Metadata = {
  title: "Ficha de diagnóstico | MiFicha",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiagnosticoFichaPage({ params }: PageProps) {
  const { id } = await params;
  return <DiagnosisViewContent diagnosisId={id} />;
}
