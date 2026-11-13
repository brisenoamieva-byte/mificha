"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup";

const CHOICES = [
  {
    id: "persona",
    title: "Cuenta persona",
    detail: "Publica fichas de jugadores (familia o representante). Un solo espacio.",
    href: "/fut/tutor",
  },
  {
    id: "academia",
    title: "Academia",
    detail: "Plantel, partidos y panel de torneo · gratis.",
    href: "/fut/signup",
  },
  {
    id: "patrocinio",
    title: "Patrocinio / marca",
    detail: "Pide información por WhatsApp. Sin ficha de jugador.",
    href: "https://wa.me/524421556155?text=Hola%20Ricardo%2C%20quiero%20informaci%C3%B3n%20sobre%20patrocinio%20en%20MiFicha.",
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
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showChooser, setShowChooser] = useState(forcePick);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) {
          setChecking(false);
          setShowChooser(forcePick);
        }
        return;
      }
      if (forcePick) {
        if (!cancelled) {
          setShowChooser(true);
          setChecking(false);
        }
        return;
      }
      if (nextOverride?.startsWith("/")) {
        window.location.assign(nextOverride);
        return;
      }
      try {
        const path = await fetchHomePath(session.access_token);
        if (path.includes("elige=1")) {
          if (!cancelled) {
            setShowChooser(true);
            setChecking(false);
          }
          return;
        }
        window.location.assign(path);
      } catch {
        if (!cancelled) {
          setShowChooser(true);
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [forcePick, nextOverride]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        const created = await signUp(
          normalizedEmail,
          password,
          "academy_admin",
          fullName.trim() || "Usuario MiFicha",
          { emailRedirectTo: `${window.location.origin}/fut/entrar` },
        );
        if (!created.session) {
          try {
            await signIn(normalizedEmail, password);
          } catch {
            setError("Cuenta creada. Confirma tu correo y vuelve a entrar.");
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
        setError("Confirma tu correo antes de continuar.");
        setLoading(false);
        return;
      }

      if (nextOverride?.startsWith("/")) {
        window.location.assign(nextOverride);
        return;
      }

      const path = await fetchHomePath(session.access_token);
      if (path.includes("elige=1")) {
        setShowChooser(true);
        setLoading(false);
        return;
      }
      window.location.assign(path);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-sm text-mf-text-muted">Revisando tu sesión…</p>;
  }

  if (showChooser) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-mf-text-secondary">
          Dos cuentas principales: persona (familia o representante) o academia. Patrocinio es
          solo contacto comercial.
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
            onClick={() => setMode(tab.id)}
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

      <button type="submit" disabled={loading} className="mf-btn-primary w-full disabled:opacity-60">
        {loading ? "Entrando…" : mode === "signup" ? "Crear cuenta y continuar" : "Entrar"}
      </button>

      <p className="text-center text-xs leading-5 text-mf-text-muted">
        Familia, representante y academia usan el mismo correo. La membresía persona ($50
        USD/año) publica fichas y desbloquea detalle en Explorar.
      </p>
    </form>
  );
}
