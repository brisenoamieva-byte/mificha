import { NextResponse } from "next/server";
import {
  ACADEMY_MEMBERSHIP_FREE_PROMO,
  createAcademyCheckout,
  findActiveAcademySub,
  grantAcademyMembership,
} from "@/lib/academy-membership";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Membresía academia anual ($150 USD).
 * - Promo gratis: registra 12 meses sin cobro.
 * - Cobro activo: Mercado Pago.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    academy_id?: string;
    payer_name?: string;
  };
  const academyId = String(body.academy_id ?? "").trim();
  if (!academyId) {
    return NextResponse.json({ error: "Falta academy_id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión para activar la membresía de academia.", loginRequired: true },
      { status: 401 },
    );
  }

  const email = (user.email ?? "").trim().toLowerCase() || null;

  try {
    const admin = createSupabaseAdminClient();
    const { data: academy, error } = await admin
      .from("academies")
      .select("id, name, owner_id, billing_exempt, plan_status")
      .eq("id", academyId)
      .maybeSingle();

    if (error || !academy) {
      return NextResponse.json({ error: "Academia no encontrada." }, { status: 404 });
    }

    if (academy.owner_id !== user.id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if ((profile as { role?: string } | null)?.role !== "admin") {
        return NextResponse.json(
          { error: "Solo el dueño de la academia puede contratar." },
          { status: 403 },
        );
      }
    }

    if (academy.billing_exempt) {
      return NextResponse.json({
        ok: true,
        alreadyActive: true,
        exempt: true,
        until: null,
      });
    }

    const existing = await findActiveAcademySub(admin, academy.id);
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyActive: true,
        until: existing.until,
      });
    }

    if (ACADEMY_MEMBERSHIP_FREE_PROMO) {
      const sub = await grantAcademyMembership(admin, {
        academyId: academy.id,
        ownerUserId: user.id,
        email,
        source: "promo",
      });
      return NextResponse.json({ ok: true, promo: true, until: sub.until });
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: "El cobro en línea aún no está activo." },
        { status: 503 },
      );
    }

    const payerName =
      String(body.payer_name ?? "").replace(/\s+/g, " ").trim() ||
      email?.split("@")[0] ||
      "Academia MiFicha";

    const { checkoutUrl, order } = await createAcademyCheckout(admin, {
      academyId: academy.id,
      ownerUserId: user.id,
      email,
      payerName,
      academyName: academy.name,
    });

    return NextResponse.json({
      ok: true,
      folio: order.folio,
      checkoutUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo procesar la membresía.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
