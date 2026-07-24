import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardPageSkeleton } from "@/components/dashboard/skeletons";

export const metadata: Metadata = {
  title: "Dashboard | MiFicha",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}
