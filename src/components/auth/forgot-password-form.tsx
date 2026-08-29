"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes("rate limit") ||
      error.message.includes("over_email_send_rate_limit")
    ) {
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    }
    return error.message;
  }
  return "No se pudo enviar el correo. Intenta de nuevo.";
}

const inputClassName = "mf-input mt-1";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Si ese correo tiene cuenta en MiFicha, te enviamos un link para elegir
          una contraseña nueva. Revisa bandeja y spam.
        </p>
        <p className="text-center text-sm text-gray-600">
          <Link href="/fut/login" className="font-medium text-[#1B4F8C] hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    );
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

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mf-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar link de recuperación"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/fut/login" className="font-medium text-[#1B4F8C] hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
