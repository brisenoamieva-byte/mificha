"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }
    if (error.message.includes("Email not confirmed")) {
      return "Confirma tu correo antes de iniciar sesión, o desactiva 'Confirm email' en Supabase.";
    }
    return error.message;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

const inputClassName = "mf-input mt-1";

async function resolveSmartNext(explicitNext: string | null) {
  if (explicitNext?.startsWith("/") && explicitNext !== "/fut/dashboard") {
    return explicitNext;
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return "/fut/entrar";
  const response = await fetch("/fut/api/me/home", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const payload = (await response.json().catch(() => ({}))) as { path?: string };
  return payload.path?.startsWith("/") ? payload.path : "/fut/entrar";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (!result.session) {
        setError("Confirma tu correo antes de iniciar sesión.");
        setLoading(false);
        return;
      }
      const destination = await resolveSmartNext(nextPath);
      window.location.assign(destination);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
          placeholder="tu@correo.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
          placeholder="Tu contraseña"
        />
      </div>

      <p className="-mt-2 text-right text-sm">
        <Link href="/fut/recuperar" className="font-medium text-[#1B4F8C] hover:underline">
          Olvidé mi contraseña
        </Link>
      </p>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mf-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Tutor, representante o academia?{" "}
        <Link href="/fut/entrar" className="font-medium text-[#1B4F8C] hover:underline">
          Usa el acceso unificado
        </Link>
      </p>
    </form>
  );
}
