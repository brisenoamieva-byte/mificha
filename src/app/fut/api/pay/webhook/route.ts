import { NextResponse } from "next/server";
import { markFamilyOrderPaid } from "@/lib/family-orders";
import { fetchMercadoPagoPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function handlePaymentNotification(paymentId: string) {
  if (!isMercadoPagoConfigured() || !paymentId) return;
  const payment = await fetchMercadoPagoPayment(paymentId);
  const folio = payment.external_reference?.trim();
  if (!folio) return;
  if (payment.status === "approved") {
    const admin = createSupabaseAdminClient();
    await markFamilyOrderPaid(admin, folio, String(payment.id ?? paymentId));
  }
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
    if (paymentId && String(topic ?? "").includes("payment")) {
      await handlePaymentNotification(paymentId);
    }
  } catch {
    /* IPN retries; always 200 */
  }
  return NextResponse.json({ ok: true });
}
