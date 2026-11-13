import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { EVENTOS_HUB } from "@/lib/content-hubs";

export const metadata: Metadata = {
  title: "Eventos | MiFicha",
  description: EVENTOS_HUB.summary,
};

export default function EventosPage() {
  return (
    <ContentHubPage
      title={EVENTOS_HUB.title}
      summary={EVENTOS_HUB.summary}
      items={EVENTOS_HUB.items}
      empty={EVENTOS_HUB.empty}
    />
  );
}
