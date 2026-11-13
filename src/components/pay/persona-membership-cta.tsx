"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PERSONA_MEMBERSHIP_FREE_PROMO,
  personaMembershipPublicCopy,
} from "@/lib/persona-membership";
import { scoutWhatsAppCheckoutHref } from "@/lib/scout-product";

export function PersonaMembershipCta({
  className,
  variant = "primary",
  nextPath = "/fut/tutor",
}: {
  className?: string;
  variant?: "primary" | "ghost";
  /** Tras activar: por defecto Mis fichas (lo principal de la cuenta). */
  nextPath?: string;
}) {
  const router = useRouter();
  const copy = personaMembershipPublicCopy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnClass = variant === "primary" ? "mf-btn-gph" : "mf-btn-gph-ghost";

  async function onActivate() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/fut/api/pay/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as {
        error?: string;
        loginRequired?: boolean;
        checkoutUrl?: string;
        ok?: boolean;
        until?: string;
      };

      if (response.status === 401 || payload.loginRequired) {
        router.push(`/fut/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl;
        return;
      }

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "No se pudo activar la membresía.");
        return;
      }

      router.refresh();
      router.push(nextPath);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={loading}
        onClick={() => void onActivate()}
        className={`${btnClass} justify-center disabled:opacity-60`}
      >
        {loading ? "Activando…" : copy.cta}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {!PERSONA_MEMBERSHIP_FREE_PROMO ? (
        <p className="mt-2 text-xs text-mf-text-muted">
          ¿Problemas con el pago?{" "}
          <a
            href={scoutWhatsAppCheckoutHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-mf-gph hover:underline"
          >
            WhatsApp
          </a>
        </p>
      ) : (
        <p className="mt-2 text-xs text-mf-text-muted">
          Necesitas cuenta.{" "}
          <Link
            href={`/fut/entrar?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-mf-gph hover:underline"
          >
            Entrar
          </Link>
        </p>
      )}
    </div>
  );
}
