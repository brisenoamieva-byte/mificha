import type { Metadata } from "next";
import { PlantelPrintContent } from "@/components/dashboard/plantel-print-content";

export const metadata: Metadata = {
  title: "QR imprimibles | MiFicha",
};

export default function PlantelPrintPage() {
  return <PlantelPrintContent />;
}
