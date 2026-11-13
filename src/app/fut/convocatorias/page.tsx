import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { CONVOCATORIAS_HUB } from "@/lib/content-hubs";

export const metadata: Metadata = {
  title: "Convocatorias | MiFicha",
  description: CONVOCATORIAS_HUB.summary,
};

export default function ConvocatoriasPage() {
  return (
    <ContentHubPage
      title={CONVOCATORIAS_HUB.title}
      summary={CONVOCATORIAS_HUB.summary}
      items={CONVOCATORIAS_HUB.items}
    />
  );
}
