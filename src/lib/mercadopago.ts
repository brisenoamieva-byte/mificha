import { getAppBaseUrl } from "@/lib/stripe";

export function isMercadoPagoConfigured() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? "";
  return Boolean(token) && !token.includes("...");
}

function accessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? "";
  if (!token || token.includes("...")) {
    throw new Error(
      "Falta MERCADOPAGO_ACCESS_TOKEN. Crea una aplicación en Mercado Pago y pégala en las variables de Vercel.",
    );
  }
  return token;
}

export interface MpPreferenceInput {
  title: string;
  priceMxn: number;
  folio: string;
  sku: string;
  payerName: string;
  payerEmail: string;
}

export async function createMercadoPagoPreference(input: MpPreferenceInput) {
  const base = getAppBaseUrl();
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: input.title,
          quantity: 1,
          currency_id: "MXN",
          unit_price: input.priceMxn,
        },
      ],
      payer: {
        name: input.payerName,
        email: input.payerEmail || undefined,
      },
      external_reference: input.folio,
      metadata: { sku: input.sku, folio: input.folio },
      back_urls: {
        success: `${base}/fut/pagar/retorno?status=success&folio=${encodeURIComponent(input.folio)}`,
        failure: `${base}/fut/pagar/retorno?status=failure&folio=${encodeURIComponent(input.folio)}`,
        pending: `${base}/fut/pagar/retorno?status=pending&folio=${encodeURIComponent(input.folio)}`,
      },
      auto_return: "approved",
      notification_url: `${base}/fut/api/pay/webhook`,
      statement_descriptor: "MIFICHAGPH",
    }),
  });

  const payload = (await response.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    message?: string;
    error?: string;
  };

  if (!response.ok || !payload.id) {
    throw new Error(payload.message || payload.error || "Mercado Pago no creó el cobro.");
  }

  const checkoutUrl =
    process.env.MERCADOPAGO_SANDBOX === "true"
      ? payload.sandbox_init_point || payload.init_point
      : payload.init_point || payload.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error("Mercado Pago no devolvió liga de pago.");
  }

  return { preferenceId: payload.id, checkoutUrl };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    id?: number;
    status?: string;
    external_reference?: string;
    transaction_amount?: number;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message || "No se leyó el pago en Mercado Pago.");
  }
  return payload;
}
