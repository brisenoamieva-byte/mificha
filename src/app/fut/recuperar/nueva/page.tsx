import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordScreen } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña | MiFicha",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-mf-text-muted">Cargando…</p>}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
