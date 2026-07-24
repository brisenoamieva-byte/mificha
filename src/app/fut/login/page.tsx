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
      subtitle="Accede al panel de tu academia"
      footer={
        <>
          <Link href="/fut/padres" className="text-mf-brand hover:underline">
            ¿Eres padre? Abre la ficha de tu hijo
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
