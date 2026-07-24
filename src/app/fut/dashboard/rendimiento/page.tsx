import type { Metadata } from "next";
import { Suspense } from "react";
import { RendimientoContent } from "@/components/dashboard/rendimiento-content";
import { Skeleton } from "@/components/dashboard/skeletons";

export const metadata: Metadata = {
  title: "Rendimiento | MiFicha",
  description:
    "Gráficas de progreso, comparativas del plantel y reportes para padres.",
};

function RendimientoFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-[520px] w-full rounded-2xl" />
    </div>
  );
}

export default function RendimientoPage() {
  return (
    <Suspense fallback={<RendimientoFallback />}>
      <RendimientoContent />
    </Suspense>
  );
}
