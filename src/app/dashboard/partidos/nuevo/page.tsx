import type { Metadata } from "next";
import { PartidosNuevoContent } from "@/components/dashboard/partidos-nuevo-content";

export const metadata: Metadata = {
  title: "Nuevo partido | MiFicha",
};

export default function PartidosNuevoPage() {
  return <PartidosNuevoContent />;
}
