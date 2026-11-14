"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  consumeAuthRedirect,
  normalizeEmailOtpType,
} from "@/lib/auth-recovery";
import { supabase } from "@/lib/supabase";

async function resolvePostConfirmPath() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return "/fut/entrar";
  try {
    const response = await fetch("/fut/api/me/home", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const payload = (await response.json().catch(() => ({}))) as { path?: string };
    if (response.ok && payload.path?.startsWith("/")) return payload.path;
  } catch {
    /* fall through */
  }
  return "/fut/tutor";
}

export function ConfirmEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Confirmando tu correo…");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const type = normalizeEmailOtpType(searchParams.get("type"));
      const next = searchParams.get("next");
      const ok = await consumeAuthRedirect();
      if (cancelled) return;

      if (!ok) {
        setStatus("error");
        setMessage(
          "No se pudo confirmar el enlace. Puede haber expirado o ya se usó. Entra y pide uno nuevo si hace falta.",
        );
        return;
      }

      setStatus("ok");
      if (type === "recovery") {
        setMessage("Correo confirmado. Te llevamos a elegir nueva contraseña…");
        router.replace("/fut/recuperar/nueva");
        return;
      }

      setMessage("Correo confirmado. Entrando a tu cuenta…");
      if (next?.startsWith("/")) {
        window.location.assign(next);
        return;
      }
      const path = await resolvePostConfirmPath();
      if (cancelled) return;
      window.location.assign(path);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <AuthShell
      title="Confirmar correo"
      subtitle="Validamos tu enlace de MiFicha."
      footer={
        <Link href="/fut/entrar" className="font-semibold text-mf-brand hover:underline">
          Ir a Entrar
        </Link>
      }
    >
      <div className="space-y-3 text-sm">
        {status === "working" ? (
          <p className="text-mf-text-muted">{message}</p>
        ) : null}
        {status === "ok" ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            {message}
          </p>
        ) : null}
        {status === "error" ? (
          <>
            <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{message}</p>
            <Link href="/fut/entrar" className="mf-btn-primary inline-flex w-full justify-center">
              Volver a Entrar
            </Link>
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
