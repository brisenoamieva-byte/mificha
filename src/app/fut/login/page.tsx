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
      subtitle="Mismo acceso para familia, representante o academia: te llevamos a tu espacio."
      footer={
        <>
          <Link href="/fut/entrar" className="font-semibold text-mf-brand hover:underline">
            Acceso unificado
          </Link>
          <span className="mx-2 text-mf-text-muted">·</span>
          <Link href="/fut" className="text-mf-brand hover:underline">
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
