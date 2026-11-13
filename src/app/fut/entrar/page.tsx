import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { UnifiedEnter } from "@/components/auth/unified-enter";

export const metadata: Metadata = {
  title: "Entrar | MiFicha",
  description:
    "Inicia sesión: cuenta persona (tutor o representante) o academia.",
};

export default function EntrarPage() {
  return (
    <AuthShell
      title="Entrar a MiFicha"
      subtitle="Correo y contraseña. Cuenta persona o academia."
    >
      <Suspense fallback={<p className="text-sm text-mf-text-muted">Cargando…</p>}>
        <UnifiedEnter />
      </Suspense>
    </AuthShell>
  );
}
