"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authConfirmUrl, signIn, signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup";

const CHOICES = [
  {
    id: "persona",
    title: "Cuenta persona",
    detail: "Publica fichas de jugadores (tutor o representante).",
    href: "/fut/tutor",
  },
  {
    id: "academia",
    title: "Academia",
    detail: "Plantel, partidos y código MF · canal sin cuota.",
    href: "/fut/signup",
  },
] as const;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (error.message.includes("Email not confirmed")) {
      return "Confirma tu correo antes de iniciar sesión.";
    }
    return error.message;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

async function fetchHomePath(accessToken: string) {
  const response = await fetch("/fut/api/me/home", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    path?: string;
    error?: string;
  };
  if (!response.ok) throw new Error(payload.error || "No se pudo abrir tu espacio.");
  return payload.path || "/fut/entrar?elige=1";
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), ms);
    void promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        window.clearTimeout(timer);
        resolve(fallback);
      });
  });
}

export function UnifiedEnter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcePick = searchParams.get("elige") === "1";
  const nextOverride = searchParams.get("next");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showChooser, setShowChooser] = useState(forcePick);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resendingConfirm, setResendingConfirm] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const showLogin = () => {
      if (cancelled) return;
      setShowChooser(forcePick);
      setChecking(false);
    };

    // Nunca dejar la pantalla colgada en "Revisando tu sesión…".
    const watchdog = window.setTimeout(showLogin, 7000);

    void (async () => {
      const sessionResult = await withTimeout(
        supabase.auth.getSession(),
        5000,
        { data: { session: null }, error: null },
      );
      if (cancelled) return;

      const session = sessionResult.data.session;
      if (!session) {
        showLogin();
        return;
      }

      if (forcePick) {
        setShowChooser(true);
        setChecking(false);
        return;
      }

      // Evita bucle entrar ↔ destino (sesión inválida / cookies a medias).
      const bounceKey = `mf_enter_bounce:${nextOverride || "home"}`;
      try {
        const last = Number(window.sessionStorage.getItem(bounceKey) || "0");
        if (last && Date.now() - last < 10000) {
          await supabase.auth.signOut().catch(() => undefined);
          setError("Tu sesión anterior se trabó. Entra de nuevo con correo y contraseña.");
          showLogin();
          return;
        }
        window.sessionStorage.setItem(bounceKey, String(Date.now()));
      } catch {
        /* sessionStorage puede fallar en modo estricto */
      }

      if (nextOverride?.startsWith("/")) {
        window.location.replace(nextOverride);
        window.setTimeout(showLogin, 4000);
        return;
      }

      try {
        const path = await withTimeout(
          fetchHomePath(session.access_token),
          6000,
          "/fut/entrar?elige=1",
        );
        if (cancelled) return;
        if (path.includes("elige=1")) {
          setShowChooser(true);
          setChecking(false);
          return;
        }
        window.location.replace(path);
        window.setTimeout(showLogin, 4000);
      } catch {
        showLogin();
      }
    })().finally(() => {
      window.clearTimeout(watchdog);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
    };
  }, [forcePick, nextOverride]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setNeedsEmailConfirm(false);
    setResendNotice(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const nextPath =
      nextOverride?.startsWith("/") ? nextOverride : "/fut/tutor";

    try {
      if (mode === "signup") {
        const created = await signUp(
          normalizedEmail,
          password,
          "academy_admin",
          fullName.trim() || "Usuario MiFicha",
          {
            nextPath,
            emailRedirectTo: authConfirmUrl({ nextPath }),
          },
        );
        if (!created.session) {
          try {
            await signIn(normalizedEmail, password);
          } catch {
            setNeedsEmailConfirm(true);
            setSuccess(
              "Cuenta creada. Te enviamos un correo para confirmar. Si no llega (spam), pídelo de nuevo abajo o escríbenos por WhatsApp al 442 155 6155.",
            );
            setMode("login");
            setLoading(false);
            return;
          }
        }
      } else {
        await signIn(normalizedEmail, password);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setNeedsEmailConfirm(true);
        setSuccess(
          "Confirma tu correo antes de continuar. Revisa spam o reenvía el enlace abajo.",
        );
        setMode("login");
        setLoading(false);
        return;
      }

      try {
        const bounceKey = `mf_enter_bounce:${nextOverride || "home"}`;
        window.sessionStorage.removeItem(bounceKey);
      } catch {
        /* ignore */
      }

      if (nextOverride?.startsWith("/")) {
        window.location.replace(nextOverride);
        return;
      }

      const path = await fetchHomePath(session.access_token);
      if (path.includes("elige=1")) {
        setShowChooser(true);
        setLoading(false);
        return;
      }
      window.location.replace(path);
    } catch (submitError) {
      const message = getErrorMessage(submitError);
      setError(message);
      if (message.includes("Confirma tu correo")) {
        setNeedsEmailConfirm(true);
      }
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setResendNotice("Escribe el correo con el que te registraste.");
      return;
    }
    setResendingConfirm(true);
    setResendNotice(null);
    try {
      const nextPath =
        nextOverride?.startsWith("/") ? nextOverride : "/fut/tutor";
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: authConfirmUrl({ nextPath }),
        },
      });
      if (resendError) throw resendError;
      setResendNotice(
        "Listo: enviamos un enlace nuevo. Revisa bandeja y spam. Si no llega en 2 minutos, mándanos WhatsApp al 442 155 6155.",
      );
    } catch (resendErr) {
      setResendNotice(
        resendErr instanceof Error
          ? resendErr.message
          : "No se pudo reenviar. Escríbenos por WhatsApp al 442 155 6155.",
      );
    } finally {
      setResendingConfirm(false);
    }
  }

  if (checking) {
    return <p className="text-sm text-mf-text-muted">Revisando tu sesión…</p>;
  }

  if (showChooser) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-mf-text-secondary">
          Elige tu tipo de cuenta: persona (tutor o representante) o academia.
        </p>
        <ul className="space-y-2">
          {CHOICES.map((choice) => {
            const external = choice.href.startsWith("http");
            const className =
              "block rounded-xl border border-mf-border bg-white px-4 py-3 transition hover:border-mf-gph/40";
            const body = (
              <>
                <p className="text-sm font-semibold text-mf-gph-ink">{choice.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-mf-text-muted">{choice.detail}</p>
              </>
            );
            return (
              <li key={choice.id}>
                {external ? (
                  <a
                    href={choice.href}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {body}
                  </a>
                ) : (
                  <Link href={choice.href} className={className}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="text-sm font-medium text-mf-brand hover:underline"
          onClick={() => {
            setShowChooser(false);
            router.replace("/fut/entrar");
          }}
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-mf-border bg-mf-canvas p-1">
        {(
          [
            { id: "login" as const, label: "Ya tengo cuenta" },
            { id: "signup" as const, label: "Crear cuenta" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMode(tab.id);
              setError(null);
              setSuccess(null);
            }}
            className={
              mode === tab.id
                ? "flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-mf-gph-ink shadow-sm"
                : "flex-1 rounded-md px-3 py-2 text-sm font-medium text-mf-text-secondary"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "signup" ? (
        <label className="block text-sm font-medium text-mf-text">
          Nombre
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mf-input mt-1"
            autoComplete="name"
            placeholder="Tu nombre"
          />
        </label>
      ) : null}

      <label className="block text-sm font-medium text-mf-text">
        Correo
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mf-input mt-1"
          autoComplete="email"
        />
      </label>

      <label className="block text-sm font-medium text-mf-text">
        Contraseña
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mf-input mt-1"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </label>

      {mode === "login" ? (
        <p className="-mt-1 text-right text-sm">
          <Link href="/fut/recuperar?next=/fut/entrar" className="font-medium text-mf-brand hover:underline">
            Olvidé mi contraseña
          </Link>
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
        </p>
      ) : null}

      {needsEmailConfirm ? (
        <div className="space-y-2 rounded-xl border border-mf-border bg-mf-canvas p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mf-text-muted">
            No llegó el correo
          </p>
          <button
            type="button"
            disabled={resendingConfirm || !email.trim()}
            onClick={() => void resendConfirmation()}
            className="mf-btn-gph-ghost w-full disabled:opacity-60"
          >
            {resendingConfirm ? "Reenviando…" : "Reenviar verificación"}
          </button>
          {resendNotice ? (
            <p className="text-xs leading-5 text-mf-text-secondary">{resendNotice}</p>
          ) : null}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className="mf-btn-primary w-full disabled:opacity-60">
        {loading ? "Entrando…" : mode === "signup" ? "Crear cuenta y continuar" : "Entrar"}
      </button>

      <p className="text-center text-xs leading-5 text-mf-text-muted">
        Tutor, representante y academia usan el mismo correo. Explorar Pro (gratis)
        publica fichas y desbloquea el detalle en
        Explorar.
      </p>
    </form>
  );
}
