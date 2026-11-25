import { NextResponse } from "next/server";
import { getAcademyOrderByFolio, markAcademyOrderPaid } from "@/lib/academy-membership";
import { getFamilyOrderByFolio, markFamilyOrderPaid } from "@/lib/family-orders";
import {
  fetchMercadoPagoPayment,
  getMercadoPagoWebhookSecret,
  isMercadoPagoConfigured,
  mercadoPagoAmountMatches,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago";
import { getPersonaOrderByFolio, markPersonaOrderPaid } from "@/lib/persona-membership";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function expectedAmountForFolio(folio: string) {
  const admin = createSupabaseAdminClient();
  if (folio.startsWith("PE-")) {
    const order = await getPersonaOrderByFolio(admin, folio);
    return order?.amount_mxn ?? null;
  }
  if (folio.startsWith("AC-")) {
    const order = await getAcademyOrderByFolio(admin, folio);
    return order?.amount_mxn ?? null;
  }
  const order = await getFamilyOrderByFolio(admin, folio);
  return order?.amount_mxn ?? null;
}

async function handlePaymentNotification(paymentId: string) {
  if (!isMercadoPagoConfigured() || !paymentId) return;
  const payment = await fetchMercadoPagoPayment(paymentId);
  const folio = payment.external_reference?.trim();
  if (!folio) return;
  if (payment.status !== "approved") return;

  const expected = await expectedAmountForFolio(folio);
  if (expected == null) return;
  if (!mercadoPagoAmountMatches(expected, payment.transaction_amount)) {
    console.warn("[mp-webhook] amount mismatch", {
      folio,
      expected,
      paid: payment.transaction_amount,
    });
    return;
  }

  const admin = createSupabaseAdminClient();
  const paymentKey = String(payment.id ?? paymentId);
  if (folio.startsWith("PE-")) {
    await markPersonaOrderPaid(admin, folio, paymentKey);
    return;
  }
  if (folio.startsWith("AC-")) {
    await markAcademyOrderPaid(admin, folio, paymentKey);
    return;
  }
  const family = await markFamilyOrderPaid(admin, folio, paymentKey);
  if (family?.sku === "diagnosis") {
    const { fireAndForgetDiagnosisPassEmail } = await import(
      "@/lib/email/diagnosis-paid-notify"
    );
    fireAndForgetDiagnosisPassEmail(admin, family);
  }
}

function readHeader(request: Request, name: string) {
  return request.headers.get(name) || request.headers.get(name.toLowerCase());
}

function assertWebhookSignature(request: Request, dataId: string | null) {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) return true;
  const ok = verifyMercadoPagoWebhookSignature({
    xSignature: readHeader(request, "x-signature"),
    xRequestId: readHeader(request, "x-request-id"),
    dataId,
    secret,
  });
  return ok;
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const queryId = url.searchParams.get("data.id") || url.searchParams.get("id");
    const body = (await request.json().catch(() => ({}))) as {
      type?: string;
      action?: string;
      data?: { id?: string };
    };
    const paymentId = body.data?.id || queryId;
    const topic = url.searchParams.get("topic") || body.type || body.action;
    const dataId = paymentId ? String(paymentId) : null;

    if (!assertWebhookSignature(request, dataId)) {
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }

    if (paymentId && String(topic ?? "").includes("payment")) {
      await handlePaymentNotification(String(paymentId));
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  try {
    // IPN legacy: sin x-signature fiable; igual exigimos pago real + monto.
    if (paymentId && String(topic ?? "").includes("payment")) {
      await handlePaymentNotification(paymentId);
    }
  } catch {
    /* IPN retries; always 200 */
  }
  return NextResponse.json({ ok: true });
}
