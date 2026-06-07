import type { Metadata } from "next";
import { ReportesContent } from "@/components/dashboard/reportes-content";

export const metadata: Metadata = {
  title: "Reportes | MiFicha",
};

export default function ReportesPage() {
  return <ReportesContent />;
}
