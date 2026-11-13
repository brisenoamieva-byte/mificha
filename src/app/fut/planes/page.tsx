import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { PLANES_HUB } from "@/lib/content-hubs";

export const metadata: Metadata = {
  title: "Planes | MiFicha",
  description: PLANES_HUB.summary,
};

export default function PlanesPage() {
  return (
    <ContentHubPage
      title={PLANES_HUB.title}
      summary={PLANES_HUB.summary}
      items={PLANES_HUB.items}
    />
  );
}
