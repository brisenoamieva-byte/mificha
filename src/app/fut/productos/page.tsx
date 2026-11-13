import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { PRODUCTOS_HUB } from "@/lib/content-hubs";

export const metadata: Metadata = {
  title: "Productos | MiFicha",
  description: PRODUCTOS_HUB.summary,
};

export default function ProductosPage() {
  return (
    <ContentHubPage
      title={PRODUCTOS_HUB.title}
      summary={PRODUCTOS_HUB.summary}
      items={PRODUCTOS_HUB.items}
    />
  );
}
