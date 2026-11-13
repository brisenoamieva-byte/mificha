import { NextResponse } from "next/server";
import {
  createPersonaCheckout,
  findActivePersonaSub,
  grantPersonaMembership,
  PERSONA_MEMBERSHIP_FREE_PROMO,
} from "@/lib/persona-membership";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Membresía persona (Explorar Pro).
 * - Promo gratis: otorga 12 meses sin cobro.
 * - Cobro activo (PERSONA_MEMBERSHIP_FREE_PROMO=false): Mercado Pago.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    payer_name?: string;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        error: "Inicia sesión para activar la membresía persona.",
        loginRequired: true,
      },
      { status: 401 },
    );
  }

  const email = (user.email ?? "").trim().toLowerCase() || null;

  try {
    const admin = createSupabaseAdminClient();
    const existing = await findActivePersonaSub(admin, user.id);
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyActive: true,
        until: existing.until,
      });
    }

    if (PERSONA_MEMBERSHIP_FREE_PROMO) {
      const sub = await grantPersonaMembership(admin, {
        userId: user.id,
        email,
        source: "promo",
      });
      return NextResponse.json({
        ok: true,
        promo: true,
        until: sub.until,
      });
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        {
          error:
            "El cobro en línea aún no está activo. Escribe por WhatsApp para contratar.",
        },
        { status: 503 },
      );
    }

    const payerName =
      String(body.payer_name ?? "").replace(/\s+/g, " ").trim() ||
      email?.split("@")[0] ||
      "Titular MiFicha";

    const { checkoutUrl, order } = await createPersonaCheckout(admin, {
      userId: user.id,
      email,
      payerName,
    });

    return NextResponse.json({
      ok: true,
      folio: order.folio,
      checkoutUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo procesar la membresía.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
