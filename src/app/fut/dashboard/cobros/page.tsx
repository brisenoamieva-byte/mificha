import type { Metadata } from "next";
import { FamilyOrdersAdmin } from "@/components/pay/family-orders-admin";

export const metadata: Metadata = {
  title: "Ganancias | MiFicha",
};

export default function DashboardCobrosPage() {
  return <FamilyOrdersAdmin />;
}
