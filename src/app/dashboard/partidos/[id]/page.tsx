import type { Metadata } from "next";
import { PartidosDetail } from "@/components/dashboard/partidos-detail";

export const metadata: Metadata = {
  title: "Detalle partido | MiFicha",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PartidoDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PartidosDetail matchId={id} />;
}
