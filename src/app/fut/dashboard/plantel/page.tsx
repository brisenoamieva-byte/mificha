import type { Metadata } from "next";
import { PlantelContent } from "@/components/dashboard/plantel-content";

export const metadata: Metadata = {
  title: "Mi Plantel | MiFicha",
};

export default function PlantelPage() {
  return <PlantelContent />;
}
