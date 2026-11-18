import type { Metadata } from "next";
import { GphAgreementsPanel } from "@/components/dashboard/gph-agreements-panel";

export const metadata: Metadata = {
  title: "Cartas compromiso GPH | MiFicha",
  description:
    "Envía y contrafirma el Reglamento y Carta Compromiso GPH 2027 en línea.",
};

export default function CartasPage() {
  return <GphAgreementsPanel />;
}
