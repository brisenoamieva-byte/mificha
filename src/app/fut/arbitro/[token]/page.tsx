import { RefereeActaApp } from "@/components/acta/referee-acta-app";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ArbitroActaPage({ params }: PageProps) {
  const { token } = await params;
  return <RefereeActaApp token={token} />;
}
