import type { Metadata } from "next";
import { Suspense } from "react";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { DemoOnePagerView } from "@/components/interno/demo-one-pager-view";

export const metadata: Metadata = {
  title: "One-pager director | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoOnePagerPage() {
  return (
    <InternoAccessGate nextPath="/interno/demo-one-pager" loadingLabel="Cargando one-pager…">
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <DemoOnePagerView />
      </Suspense>
    </InternoAccessGate>
  );
}
