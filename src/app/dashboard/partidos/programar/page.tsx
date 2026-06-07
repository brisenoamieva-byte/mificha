import type { Metadata } from "next";
import { PartidosProgramarContent } from "@/components/dashboard/partidos-programar-content";

export const metadata: Metadata = {
  title: "Programar partido | MiFicha",
};

export default function ProgramarPartidoPage() {
  return <PartidosProgramarContent />;
}
