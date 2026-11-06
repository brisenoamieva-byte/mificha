import type { Metadata } from "next";
import { VisoriaAdminList } from "@/components/visoria/visoria-admin-list";

export const metadata: Metadata = {
  title: "Visorías | MiFicha",
  description: "Registros de visorías GPH / CRACKS.",
};

export default function DashboardVisoriasPage() {
  return <VisoriaAdminList />;
}
