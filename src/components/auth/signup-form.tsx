"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { LEGAL_ROUTES, TERMS_ACCEPTANCE_LABEL } from "@/lib/legal";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("User already registered")) {
      return "Este correo ya está registrado. Inicia sesión.";
    }
    if (error.message.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (error.message.includes("Unable to validate email")) {
      return "Ingresa un correo válido.";
    }
    if (
      error.message.includes("row-level security") ||
      error.message.includes("new row violates")
    ) {
      return "No se pudo crear tu perfil. Ejecuta supabase/fix-auth.sql en Supabase e intenta de nuevo.";
    }
    if (
      error.message.includes("rate limit") ||
      error.message.includes("over_email_send_rate_limit")
    ) {
      return "Supabase bloqueó el envío de correos. Desactiva 'Confirm email' en Authentication → Email e intenta en unos minutos.";
    }
    return error.message;
  }
  return "Ocurrió un error. Intenta de nuevo.";
}

const inputClassName = "mf-input mt-1";

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.");
      return;
    }

    setLoading(true);

    try {
      const data = await signUp(email, password, "academy_admin", fullName);

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(
        "Cuenta creada. Si activaste confirmación por correo, revísalo y luego inicia sesión.",
      );
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClassName}
          placeholder="Ej. Carlos Méndez"
        />
      </div>

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
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-mf-border bg-mf-surface px-3 py-3">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          required
          className="mt-1 h-4 w-4 rounded border-mf-border text-[#1B4F8C]"
        />
        <span className="text-sm leading-6 text-gray-700">
          {TERMS_ACCEPTANCE_LABEL}{" "}
          <Link href={LEGAL_ROUTES.terms} className="font-semibold text-[#1B4F8C] hover:underline">
            Términos
          </Link>{" "}
          ·{" "}
          <Link href={LEGAL_ROUTES.privacy} className="font-semibold text-[#1B4F8C] hover:underline">
            Privacidad
          </Link>
        </span>
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mf-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta de academia"}
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-[#1B4F8C] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
