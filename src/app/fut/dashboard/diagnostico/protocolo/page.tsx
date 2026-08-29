import type { Metadata } from "next";
import { GphProtocolContent } from "@/components/diagnosis/gph-protocol-content";

export const metadata: Metadata = {
  title: "Protocolo GPH en cancha | MiFicha",
};

export default function ProtocoloGphPage() {
  return <GphProtocolContent />;
}
