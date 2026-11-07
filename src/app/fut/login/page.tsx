import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | MiFicha",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Panel de academia. Si eres papá o mamá, usa la cuenta de tutor."
      footer={
        <>
          <Link href="/fut/tutor" className="font-semibold text-mf-brand hover:underline">
            ¿Eres padre? Entrar como tutor
          </Link>
          <span className="mx-2 text-mf-text-muted">·</span>
          <Link href="/" className="text-mf-brand hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-gray-500">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
