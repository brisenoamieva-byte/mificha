import type { Metadata } from "next";
import { DiagnosisEditContent } from "@/components/diagnosis/diagnosis-edit-content";

export const metadata: Metadata = {
  title: "Continuar diagnóstico | MiFicha",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiagnosticoEditarPage({ params }: PageProps) {
  const { id } = await params;
  return <DiagnosisEditContent diagnosisId={id} />;
}
