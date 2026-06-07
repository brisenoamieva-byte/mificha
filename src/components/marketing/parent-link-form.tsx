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
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-mf-border bg-mf-surface p-6 shadow-[var(--mf-shadow)] sm:p-8"
      >
        <p className="mf-marketing-eyebrow">Acceso directo</p>
        <label htmlFor="player-link" className="mt-3 block text-lg font-semibold text-mf-text">
          Pega el link de la ficha
        </label>
        <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
          URL completa o solo el identificador al final del enlace.
        </p>
        <input
          id="player-link"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="https://mificha.mx/j/nombre-jugador-abc123"
          className="mf-input mt-5"
        />
        {error ? <p className="mt-3 text-sm text-mf-danger">{error}</p> : null}
        <button type="submit" className="mf-btn-primary mt-5">
          Abrir ficha
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-xl border border-mf-border bg-mf-surface p-5 transition hover:border-mf-brand/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mf-brand-soft text-mf-brand">
              <step.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-mf-text">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">
              {step.description}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-mf-border bg-mf-canvas p-6">
        <p className="text-sm font-semibold text-mf-text">¿Aún no tienes link?</p>
        <p className="mt-2 text-sm leading-7 text-mf-text-secondary">
          Pídele a la academia de tu hijo que active la ficha pública. Ellos te
          comparten el QR o el enlace por WhatsApp.
        </p>
        <Link href="/explorar" className="mf-btn-secondary mt-5 inline-flex">
          Explorar fichas públicas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
