import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { getAppBaseUrl, getStripeClient, planFromStripeMetadata } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function sendPaymentFailedEmail(academyName: string, recipientEmail: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re_...") return;

  const resend = new Resend(resendKey);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "MiFicha <onboarding@resend.dev>";
  const appUrl = getAppBaseUrl();

  await resend.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject: `Problema con tu suscripción MiFicha · ${academyName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h1 style="color:#1B4F8C;">Tu suscripción requiere atención</h1>
        <p>No pudimos procesar el último pago de <strong>${academyName}</strong>.</p>
        <p>Actualiza tu método de pago para mantener activa tu academia en MiFicha.</p>
        <p><a href="${appUrl}/dashboard" style="display:inline-block;background:#1B4F8C;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">Ir al dashboard</a></p>
      </div>
    `,
    text: `No pudimos procesar el último pago de ${academyName}. Actualiza tu método de pago en ${appUrl}/dashboard`,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const academyId = session.metadata?.academy_id;
  const plan = planFromStripeMetadata(session.metadata?.plan);

  if (!academyId || !plan) return;

  const supabase = createSupabaseAdminClient();

  await supabase
    .from("academies")
    .update({
      plan_status: plan,
      stripe_subscription_id:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
      stripe_customer_id:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
    })
    .eq("id", academyId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  if (!customerId) return;

  const supabase = createSupabaseAdminClient();
  const { data: academy } = await supabase
    .from("academies")
    .select("id, name, owner_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!academy) return;

  await supabase
    .from("academies")
    .update({ plan_status: "inactive" })
    .eq("id", academy.id);

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", academy.owner_id)
    .maybeSingle();

  if (ownerProfile?.email) {
    await sendPaymentFailedEmail(academy.name, ownerProfile.email);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === "whsec_...") {
    return NextResponse.json(
      { error: "Configura STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
