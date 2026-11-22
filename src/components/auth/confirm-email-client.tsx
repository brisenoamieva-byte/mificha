"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { authConfirmUrl } from "@/lib/auth";
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
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const type = normalizeEmailOtpType(searchParams.get("type"));
      const next = searchParams.get("next");
      const ok = await consumeAuthRedirect();

      // Si el enlace ya se usó (doble clic / preview de Gmail), la sesión puede existir.
      let hasSession = ok;
      if (!hasSession) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        hasSession = Boolean(session);
      }

      if (cancelled) return;

      if (!hasSession) {
        setStatus("error");
        setMessage(
          "Este enlace ya no es válido (caducó o se usó). Si ya confirmaste, entra con tu correo. Si no, pide uno nuevo abajo.",
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

  async function resendConfirmation() {
    const email = resendEmail.trim().toLowerCase();
    if (!email) {
      setResendNotice("Escribe el correo con el que te registraste.");
      return;
    }
    setResending(true);
    setResendNotice(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: authConfirmUrl({ nextPath: "/fut/tutor" }),
        },
      });
      if (error) throw error;
      setResendNotice("Te enviamos un correo nuevo. Abre el enlace más reciente.");
    } catch (error) {
      setResendNotice(
        error instanceof Error
          ? error.message
          : "No se pudo reenviar. Intenta desde Entrar.",
      );
    } finally {
      setResending(false);
    }
  }

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
              Entrar con correo y contraseña
            </Link>
            <div className="space-y-2 rounded-xl border border-mf-border bg-mf-canvas p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
                Reenviar confirmación
              </p>
              <input
                type="email"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                className="mf-input"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
              <button
                type="button"
                disabled={resending}
                onClick={() => void resendConfirmation()}
                className="mf-btn-gph-ghost w-full disabled:opacity-60"
              >
                {resending ? "Enviando…" : "Enviar enlace nuevo"}
              </button>
              {resendNotice ? (
                <p className="text-xs leading-5 text-mf-text-secondary">{resendNotice}</p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
