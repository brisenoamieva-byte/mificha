import type { Metadata } from "next";
import { PartidosContent } from "@/components/dashboard/partidos-content";

export const metadata: Metadata = {
  title: "Partidos | MiFicha",
};

export default function PartidosPage() {
  return <PartidosContent />;
}
