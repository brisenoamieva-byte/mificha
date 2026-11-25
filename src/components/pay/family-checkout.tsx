"use client";

import { useEffect, useState } from "react";
import {
  diagnosisBookingCtaLabel,
  diagnosisBookingHref,
  diagnosisBookingIsCalendar,
  diagnosisWhatsAppHref,
} from "@/lib/gph-alliance";
import { DiagnosisPromoPrice } from "@/components/marketing/diagnosis-promo-price";
import { GphAnnualPassBenefits } from "@/components/marketing/gph-annual-pass-benefits";
import {
  FAMILY_PRODUCTS,
  GPH_ANNUAL_PASS,
  MEMBERSHIP_CHECKOUT_DISABLED,
  type FamilySku,
} from "@/lib/gph-commerce";

const inputClass =
  "mf-input mt-1 focus:!border-mf-gph focus:!shadow-[0_0_0_3px_color-mix(in_srgb,var(--mf-gph)_16%,transparent)]";

export function FamilyCheckout({
  initialSku,
  initialPlayerName,
  mercadoPagoReady,
}: {
  initialSku?: FamilySku;
  initialPlayerName?: string;
  mercadoPagoReady: boolean;
}) {
  const sku: FamilySku =
    MEMBERSHIP_CHECKOUT_DISABLED || initialSku !== "membership"
      ? "diagnosis"
      : (initialSku ?? "diagnosis");
  const [payerName, setPayerName] = useState("");
  const [playerName, setPlayerName] = useState(initialPlayerName?.trim() ?? "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const product = FAMILY_PRODUCTS.diagnosis;
  const bookingHref = diagnosisBookingHref(playerName);
  const bookingIsCalendar = diagnosisBookingIsCalendar();

  useEffect(() => {
    if (initialPlayerName?.trim()) {
      setPlayerName(initialPlayerName.trim());
    }
  }, [initialPlayerName]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
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
      {!mercadoPagoReady ? (
        <p className="rounded-xl border border-mf-border bg-white px-4 py-3 text-sm leading-6 text-mf-text-secondary">
          El cobro en línea con Mercado Pago aún se está activando. Mientras tanto, agenda el
          diagnóstico por WhatsApp.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="overflow-hidden rounded-xl border border-[#fda4af] bg-white shadow-[0_12px_32px_-20px_rgba(225,29,72,0.55)]">
          <div className="bg-[#fff1f2] px-5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
              Se paga hoy · promoción
            </p>
          </div>
          <div className="bg-mf-gph-soft/40 px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold tracking-tight text-mf-gph-ink">
                {product.publicName}
              </p>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-mf-gph ring-1 ring-mf-gph/25">
                {product.locationLabel}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-mf-gph">
              {GPH_ANNUAL_PASS.eyebrow}
            </p>
            <DiagnosisPromoPrice className="mt-3" size="lg" tone="gph" />
            <p className="mt-2 text-xs text-mf-text-muted">{product.period}</p>
            <GphAnnualPassBenefits className="mt-4" />
            <p className="mt-4 text-sm font-medium leading-6 text-mf-gph-ink">
              {product.locationDetail}
            </p>
            <p className="mt-3 text-xs leading-5 text-mf-text-muted">
              {bookingIsCalendar
                ? "Después del pago eliges fecha del diagnóstico en el calendario GPH."
                : "La fecha del diagnóstico se coordina con GPH por WhatsApp tras el pago."}
            </p>
          </div>
        </div>

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
                Datos para el pago
              </h2>
              <p className="mt-1 text-sm text-mf-text-secondary">
                {mercadoPagoReady
                  ? "Tarjeta, transferencia o OXXO. Al confirmar el pago te enviamos el certificado PDF del Pase Anual 2027 al correo."
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
                required
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                className={inputClass}
                placeholder="Como aparecerá en el certificado"
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
                  Correo (certificado PDF)
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  placeholder="obligatorio"
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
                {loading ? "Abriendo Mercado Pago…" : "Continuar al pago"}
              </button>
            ) : (
              <a
                href={bookingHref}
                className="mf-btn-gph w-full justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                {diagnosisBookingCtaLabel("Agendar por WhatsApp")}
              </a>
            )}
            <a
              href={
                mercadoPagoReady && bookingIsCalendar
                  ? bookingHref
                  : diagnosisWhatsAppHref(playerName)
              }
              className="block text-center text-xs font-semibold text-mf-gph hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {mercadoPagoReady
                ? bookingIsCalendar
                  ? "Ver horarios disponibles"
                  : "Prefiero coordinar por WhatsApp"
                : bookingIsCalendar
                  ? "Abrir calendario GPH"
                  : "Abrir WhatsApp GPH"}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
