import type { Metadata } from "next";
import { TutorAgreementView } from "@/components/tutor/tutor-agreement-view";

export const metadata: Metadata = {
  title: "Firmar reglamento GPH | MiFicha",
  description: "Lee y acepta el Reglamento y Carta Compromiso de GPH Performance Hub.",
};

export default async function TutorAcuerdoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mf-page px-4 py-8 sm:px-6">
      <TutorAgreementView agreementId={id} />
    </main>
  );
}
