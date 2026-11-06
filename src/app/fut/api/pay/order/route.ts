import { NextResponse } from "next/server";
import { getFamilyOrderByFolio } from "@/lib/family-orders";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const folio = new URL(request.url).searchParams.get("folio")?.trim() ?? "";
  if (!folio) return NextResponse.json({ error: "Falta folio." }, { status: 400 });
  try {
    const admin = createSupabaseAdminClient();
    const order = await getFamilyOrderByFolio(admin, folio);
    if (!order) return NextResponse.json({ error: "No encontramos ese folio." }, { status: 404 });
    return NextResponse.json({
      folio: order.folio,
      sku: order.sku,
      status: order.status,
      amount_mxn: order.amount_mxn,
      membership_until: order.membership_until,
      player_name: order.player_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo consultar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
