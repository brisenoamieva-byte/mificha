import type { Metadata } from "next";
import { Suspense } from "react";
import { DiagnosisNewContent } from "@/components/diagnosis/diagnosis-new-content";
import { Skeleton } from "@/components/dashboard/skeletons";

export const metadata: Metadata = {
  title: "Nueva evaluación | MiFicha",
};

export default function NuevaEvaluacionPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-2xl" />}>
      <DiagnosisNewContent />
    </Suspense>
  );
}
