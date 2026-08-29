"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { consumeAuthRedirect } from "@/lib/auth-recovery";
import { updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (error.message.includes("Auth session missing") || error.message.includes("not authenticated")) {
      return "El link expiró o ya se usó. Solicita uno nuevo.";
    }
    return error.message;
  }
  return "No se pudo guardar la contraseña. Intenta de nuevo.";
}

const inputClassName = "mf-input mt-1";

export function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSessionReady(true);
        setChecking(false);
      }
    });

    void consumeAuthRedirect().then((ok) => {
      if (cancelled) return;
      if (ok) {
        setSessionReady(true);
        setChecking(false);
        return;
      }
      void supabase.auth.getSession().then(({ data: sessionData }) => {
        if (cancelled) return;
        setSessionReady(Boolean(sessionData.session));
        setChecking(false);
      });
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      router.push("/fut/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AuthShell title="Validando el link" subtitle="Un momento." footer={null}>
        <p className="text-sm text-mf-text-secondary">Comprobando el enlace de recuperación…</p>
      </AuthShell>
    );
  }

  if (!sessionReady) {
    return (
      <AuthShell
        title="Este link ya no sirve"
        subtitle="Pide uno nuevo con el correo de tu cuenta. Cada enlace caduca y solo se puede usar una vez."
        footer={
          <Link href="/fut/login" className="text-mf-brand hover:underline">
            Iniciar sesión
          </Link>
        }
      >
        <a href="/fut/recuperar" className="mf-btn-primary inline-flex w-full justify-center">
          Pedir link nuevo
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Elige una contraseña nueva"
      subtitle="Después entra con tu correo y esta clave."
      footer={
        <Link href="/fut/login" className="text-mf-brand hover:underline">
          Iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña nueva
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={inputClassName}
            placeholder="Repite la contraseña"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mf-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </AuthShell>
  );
}
