import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña | MiFicha",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviamos un link al correo de tu cuenta para elegir una nueva."
      footer={
        <>
          <Link href="/fut/login" className="text-mf-brand hover:underline">
            Iniciar sesión
          </Link>
          <span className="mx-2 text-mf-text-muted">·</span>
          <Link href="/fut/tutor" className="text-mf-brand hover:underline">
            Entrar como tutor
          </Link>
          <span className="mx-2 text-mf-text-muted">·</span>
          <Link href="/" className="text-mf-brand hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-gray-500">Cargando…</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
