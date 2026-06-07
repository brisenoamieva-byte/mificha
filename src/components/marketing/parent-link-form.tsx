"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { parsePlayerSlugFromInput } from "@/lib/public-directory";

const steps = [
  {
    icon: QrCode,
    title: "Escanea el QR",
    description: "Tu academia te lo comparte por WhatsApp o en la cancha.",
  },
  {
    icon: Link2,
    title: "Abre el link",
    description: "Pega la URL que te enviaron o escríbela abajo.",
  },
  {
    icon: ShieldCheck,
    title: "Consulta stats verificados",
    description: "Sin cuenta, sin contraseña, sin descargar nada.",
  },
];

export function ParentLinkForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const slug = parsePlayerSlugFromInput(input);
    if (!slug) {
      setError("Ingresa el link o identificador de la ficha.");
      return;
    }

    router.push(`/j/${encodeURIComponent(slug)}`);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="mf-card p-6">
        <label htmlFor="player-link" className="block text-sm font-medium text-mf-text">
          ¿Tienes el link de tu hijo?
        </label>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Pega la URL completa o solo el identificador al final del link.
        </p>
        <input
          id="player-link"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="https://mificha.mx/j/nombre-jugador-abc123"
          className="mf-input mt-4"
        />
        {error ? (
          <p className="mt-3 text-sm text-mf-danger">{error}</p>
        ) : null}
        <button type="submit" className="mf-btn-primary mt-4">
          Abrir ficha
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="mf-card p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-mf-brand-soft text-mf-brand">
              <step.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-mf-text">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mf-card p-6">
        <p className="text-sm font-medium text-mf-text">¿Aún no tienes link?</p>
        <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
          Pídele a la academia de tu hijo que active la ficha pública. Ellos te
          comparten el QR o el enlace por WhatsApp.
        </p>
        <Link href="/explorar" className="mf-btn-secondary mt-4 inline-flex">
          Explorar fichas públicas
        </Link>
      </div>
    </div>
  );
}
