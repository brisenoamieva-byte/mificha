import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { NOTICIAS_HUB } from "@/lib/content-hubs";

export const metadata: Metadata = {
  title: "Noticias | MiFicha",
  description: NOTICIAS_HUB.summary,
};

export default function NoticiasPage() {
  return (
    <ContentHubPage
      title={NOTICIAS_HUB.title}
      summary={NOTICIAS_HUB.summary}
      items={NOTICIAS_HUB.items}
    />
  );
}
