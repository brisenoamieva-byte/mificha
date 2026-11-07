import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";
import { WithBrandName } from "@/components/ui/brand-wordmark";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Crear cuenta | MiFicha",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Crea tu cuenta de academia"
      subtitle={
        <WithBrandName>
          Para colegios y clubes. Si eres padre, crea la ficha en la cuenta de tutor
          (piloto gratis).
        </WithBrandName>
      }
      footer={
        <>
          <Link href="/fut/tutor" className="font-semibold text-mf-brand hover:underline">
            ¿Eres padre? Crear cuenta de tutor
          </Link>
          <span className="mx-2 text-mf-text-muted">·</span>
          <Link href="/" className="text-mf-brand hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-gray-500">Cargando…</p>}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
