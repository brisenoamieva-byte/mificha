import type { Metadata } from "next";
import { JoinAcademyContent } from "@/components/auth/join-academy-content";

export const metadata: Metadata = {
  title: "Unirse al equipo | MiFicha",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function UnirsePage({ params }: PageProps) {
  const { token } = await params;
  return <JoinAcademyContent token={token} />;
}
