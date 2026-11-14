import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmEmailClient } from "@/components/auth/confirm-email-client";

export const metadata: Metadata = {
  title: "Confirmar correo | MiFicha",
  robots: { index: false, follow: false },
};

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-mf-text-muted">Cargando…</p>}>
      <ConfirmEmailClient />
    </Suspense>
  );
}
