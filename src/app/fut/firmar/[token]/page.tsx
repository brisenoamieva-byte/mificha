import { DelegateSignApp } from "@/components/acta/delegate-sign-app";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function FirmarActaPage({ params }: PageProps) {
  const { token } = await params;
  return <DelegateSignApp token={token} />;
}
