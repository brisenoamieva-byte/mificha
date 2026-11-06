"use client";

import { useState } from "react";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import { FAMILY_PRODUCTS, formatMxn, type FamilySku } from "@/lib/gph-commerce";

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

export function FamilyCheckout({ initialSku }: { initialSku?: FamilySku }) {
  const [sku, setSku] = useState<FamilySku>(initialSku ?? "diagnosis");
  const [payerName, setPayerName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const product = FAMILY_PRODUCTS[sku];

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/fut/api/pay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          payer_name: payerName,
          payer_email: email,
          payer_phone: phone,
          player_name: playerName,
        }),
      });
      const payload = (await response.json()) as { error?: string; checkoutUrl?: string };
      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.error ?? "No se pudo abrir Mercado Pago.");
        return;
      }
      window.location.href = payload.checkoutUrl;
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
      <div className="grid gap-3">
        {(Object.values(FAMILY_PRODUCTS) as (typeof FAMILY_PRODUCTS)[FamilySku][]).map((item) => {
          const selected = item.sku === sku;
          return (
            <button
              key={item.sku}
              type="button"
              onClick={() => setSku(item.sku)}
              className={
                selected
                  ? "rounded-xl border border-mf-gph bg-mf-gph-soft px-5 py-5 text-left"
                  : "rounded-xl border border-mf-border bg-white px-5 py-5 text-left hover:border-mf-gph/40"
              }
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                {item.sku === "diagnosis" ? "Recomendado" : "Solo plataforma"}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-mf-gph-ink">
                {item.publicName}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-mf-gph">
                {formatMxn(item.priceMxn)}
              </p>
              <p className="mt-1 text-xs text-mf-text-muted">{item.period}</p>
              <p className="mt-3 text-sm leading-6 text-mf-text-secondary">{item.description}</p>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="overflow-hidden rounded-xl border border-mf-border bg-white shadow-[var(--mf-shadow)]"
      >
        <div className="h-1 bg-mf-gph" aria-hidden />
        <div className="space-y-4 p-5 sm:p-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
              Pago con Mercado Pago
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
              {product.publicName} · {product.priceLabel}
            </h2>
            <p className="mt-1 text-sm text-mf-text-secondary">
              Tarjeta, transferencia o OXXO. El cargo aparece como MiFicha / GPH.
            </p>
          </div>
          <div>
            <label htmlFor="payerName" className="text-sm font-medium text-mf-text">
              Nombre de quien paga
            </label>
            <input
              id="payerName"
              required
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="playerName" className="text-sm font-medium text-mf-text">
              Nombre del jugador
            </label>
            <input
              id="playerName"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-mf-text">
                WhatsApp
              </label>
              <input
                id="phone"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                placeholder="10 dígitos"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-mf-text">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {error ? (
            <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">{error}</p>
          ) : null}
          <button type="submit" disabled={loading} className="mf-btn-gph w-full justify-center">
            {loading ? "Abriendo Mercado Pago…" : `Pagar ${product.priceLabel}`}
          </button>
          <a
            href={diagnosisWhatsAppHref(playerName)}
            className="block text-center text-xs font-semibold text-mf-gph hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Prefiero coordinar por WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
