import type { Metadata } from "next";
import { Suspense } from "react";
import { InternoAccessGate } from "@/components/interno/interno-access-gate";
import { OrganizerOnePagerView } from "@/components/interno/organizer-one-pager-view";

export const metadata: Metadata = {
  title: "One-pager organizador | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default function OrganizadoresInternoPage() {
  return (
    <InternoAccessGate
      nextPath="/interno/organizadores"
      loadingLabel="Cargando one-pager organizador…"
    >
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <OrganizerOnePagerView />
      </Suspense>
    </InternoAccessGate>
  );
}
