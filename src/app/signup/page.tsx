import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { WithBrandName } from "@/components/ui/brand-wordmark";

export const metadata: Metadata = {
  title: "Crear cuenta | MiFicha",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Crea tu cuenta de academia"
      subtitle={
        <WithBrandName>
          Para academias del piloto en Querétaro. Carga plantel; MiFicha sincroniza el
          acta del torneo.
        </WithBrandName>
      }
      footer={
        <>
          <Link href="/" className="text-[#1B4F8C] hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
