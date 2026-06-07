"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth";

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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
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
          placeholder="tu@academia.com"
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
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-[#1B4F8C] hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
