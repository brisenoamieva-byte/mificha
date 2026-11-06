import { NextResponse } from "next/server";
import { canManageFamilyOrders, listFamilyOrders } from "@/lib/family-orders";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const allowed = await canManageFamilyOrders(admin, user);
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const orders = await listFamilyOrders(admin);
  return NextResponse.json({ orders });
}
