import { NextResponse } from "next/server";
import { createFamilyOrder, parseCheckoutInput, patchFamilyOrder } from "@/lib/family-orders";
import { MEMBERSHIP_CHECKOUT_DISABLED, familyProduct } from "@/lib/gph-commerce";
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const parsed = parseCheckoutInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (MEMBERSHIP_CHECKOUT_DISABLED && parsed.data.sku === "membership") {
    return NextResponse.json(
      {
        error:
          "La membresía está gratis en el piloto. Entra en /fut/tutor sin pagar. Solo el diagnóstico GPH se cobra.",
      },
      { status: 400 },
    );
  }

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Aún no está conectado Mercado Pago. Configura MERCADOPAGO_ACCESS_TOKEN en Vercel o escríbenos por WhatsApp.",
      },
      { status: 503 },
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const order = await createFamilyOrder(admin, parsed.data);
    const product = familyProduct(order.sku);
    if (!product) {
      return NextResponse.json({ error: "Producto inválido." }, { status: 400 });
    }

    const preference = await createMercadoPagoPreference({
      title: product.title,
      priceMxn: product.priceMxn,
      folio: order.folio,
      sku: order.sku,
      payerName: order.payer_name,
      payerEmail: order.payer_email ?? "",
    });

    await patchFamilyOrder(admin, order.folio, {
      mp_preference_id: preference.preferenceId,
    });

    return NextResponse.json({
      ok: true,
      folio: order.folio,
      checkoutUrl: preference.checkoutUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
