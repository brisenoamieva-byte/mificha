"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { diagnosisWhatsAppHref } from "@/lib/gph-alliance";
import {
  FAMILY_PRODUCTS,
  MEMBERSHIP_CHECKOUT_DISABLED,
  formatMxn,
  type FamilySku,
} from "@/lib/gph-commerce";

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

export function FamilyCheckout({
  initialSku,
  mercadoPagoReady,
}: {
  initialSku?: FamilySku;
  mercadoPagoReady: boolean;
}) {
  const preferred: FamilySku =
    initialSku === "membership" && MEMBERSHIP_CHECKOUT_DISABLED
      ? "diagnosis"
      : (initialSku ?? "diagnosis");
  const [sku, setSku] = useState<FamilySku>(preferred);
  const [payerName, setPayerName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const product = FAMILY_PRODUCTS[sku];
  const membershipBlocked = MEMBERSHIP_CHECKOUT_DISABLED && sku === "membership";

  useEffect(() => {
    if (initialSku === "membership" && MEMBERSHIP_CHECKOUT_DISABLED) {
      setSku("diagnosis");
    } else if (initialSku) {
      setSku(initialSku);
    }
  }, [initialSku]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (membershipBlocked) {
      setError("La membresía está gratis en el piloto. Entra como tutor sin pagar.");
      return;
    }
    if (!mercadoPagoReady) {
      setError(
        "Mercado Pago aún no está conectado. Agenda el diagnóstico por WhatsApp o vuelve cuando esté activo el cobro en línea.",
      );
      return;
    }
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
    <div className="space-y-6">
      {MEMBERSHIP_CHECKOUT_DISABLED ? (
        <p className="rounded-xl border border-mf-gph/30 bg-mf-gph-soft px-4 py-3 text-sm leading-6 text-mf-gph-ink">
          <span className="font-semibold">Piloto:</span> la membresía anual no se cobra. Usa{" "}
          <Link href="/fut/tutor" className="font-semibold underline">
            el espacio de tutor
          </Link>{" "}
          gratis. Aquí solo se paga el <span className="font-semibold">diagnóstico GPH</span>{" "}
          ({FAMILY_PRODUCTS.diagnosis.priceLabel}), que ya incluye 12 meses de plataforma.
        </p>
      ) : null}
      {!mercadoPagoReady ? (
        <p className="rounded-xl border border-mf-border bg-white px-4 py-3 text-sm leading-6 text-mf-text-secondary">
          El cobro en línea con Mercado Pago aún se está activando. Mientras tanto, agenda el
          diagnóstico por WhatsApp.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="grid gap-3">
          {(
            Object.values(FAMILY_PRODUCTS) as (typeof FAMILY_PRODUCTS)[FamilySku][]
          )
            .filter(
              (item) =>
                !(MEMBERSHIP_CHECKOUT_DISABLED && item.sku === "membership"),
            )
            .map((item) => {
            const selected = item.sku === sku;
            return (
              <div
                key={item.sku}
                className={
                  selected
                    ? "rounded-xl border border-mf-gph bg-mf-gph-soft px-5 py-5 text-left"
                    : "rounded-xl border border-mf-border bg-white px-5 py-5 text-left"
                }
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  Se paga
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-mf-gph-ink">
                  {item.publicName}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-mf-gph">
                  {formatMxn(item.priceMxn)}
                </p>
                <p className="mt-1 text-xs text-mf-text-muted">{item.period}</p>
                <p className="mt-3 text-sm leading-6 text-mf-text-secondary">{item.description}</p>
              </div>
            );
          })}
          {MEMBERSHIP_CHECKOUT_DISABLED ? (
            <div className="rounded-xl border border-dashed border-mf-border bg-white px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-text-muted">
                Gratis en piloto
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-mf-gph-ink">
                {FAMILY_PRODUCTS.membership.publicName}
              </p>
              <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
                Sin cobro por ahora.{" "}
                <Link href="/fut/tutor" className="font-semibold text-mf-gph hover:underline">
                  Entra como tutor
                </Link>{" "}
                · lista {FAMILY_PRODUCTS.membership.priceLabel}/año al cerrar el piloto.
              </p>
            </div>
          ) : null}
        </div>

        {membershipBlocked ? (
          <div className="overflow-hidden rounded-xl border border-mf-border bg-white shadow-[var(--mf-shadow)]">
            <div className="h-1 bg-mf-gph" aria-hidden />
            <div className="space-y-4 p-5 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                Piloto gratuito
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-mf-gph-ink">
                Membresía sin cobro por ahora
              </h2>
              <p className="text-sm leading-6 text-mf-text-secondary">
                Entra como tutor, arma la ficha de tu hijo y compártela. Cuando cerremos el
                piloto, el precio de lista será {FAMILY_PRODUCTS.membership.priceLabel} al año.
              </p>
              <Link href="/fut/tutor" className="mf-btn-gph w-full justify-center">
                Entrar como tutor
              </Link>
              <button
                type="button"
                className="mf-btn-gph-ghost w-full justify-center"
                onClick={() => setSku("diagnosis")}
              >
                Prefiero pagar diagnóstico GPH
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => void onSubmit(event)}
            className="overflow-hidden rounded-xl border border-mf-border bg-white shadow-[var(--mf-shadow)]"
          >
            <div className="h-1 bg-mf-gph" aria-hidden />
            <div className="space-y-4 p-5 sm:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mf-gph">
                  {mercadoPagoReady ? "Pago con Mercado Pago" : "Diagnóstico GPH"}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-mf-gph-ink">
                  {product.publicName} · {product.priceLabel}
                </h2>
                <p className="mt-1 text-sm text-mf-text-secondary">
                  {mercadoPagoReady
                    ? "Tarjeta, transferencia o OXXO. El cargo aparece como MiFicha / GPH. Incluye 12 meses de plataforma."
                    : "Cuando Mercado Pago esté activo podrás pagar aquí. Mientras, coordina por WhatsApp."}
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
                <p className="rounded-lg bg-mf-danger-soft px-3 py-2 text-sm text-mf-danger">
                  {error}
                </p>
              ) : null}
              {mercadoPagoReady ? (
                <button type="submit" disabled={loading} className="mf-btn-gph w-full justify-center">
                  {loading ? "Abriendo Mercado Pago…" : `Pagar ${product.priceLabel}`}
                </button>
              ) : (
                <a
                  href={diagnosisWhatsAppHref(playerName)}
                  className="mf-btn-gph w-full justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Agendar por WhatsApp
                </a>
              )}
              <a
                href={diagnosisWhatsAppHref(playerName)}
                className="block text-center text-xs font-semibold text-mf-gph hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {mercadoPagoReady ? "Prefiero coordinar por WhatsApp" : "Abrir WhatsApp GPH"}
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
