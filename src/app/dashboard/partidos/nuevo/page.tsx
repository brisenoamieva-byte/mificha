import type { Metadata } from "next";
import { Suspense } from "react";
import { PartidosNuevoContent } from "@/components/dashboard/partidos-nuevo-content";

export const metadata: Metadata = {
  title: "Nuevo partido | MiFicha",
};

export default function PartidosNuevoPage() {
  return (
    <Suspense fallback={<p className="p-6 text-slate-500">Cargando...</p>}>
      <PartidosNuevoContent />
    </Suspense>
  );
}
