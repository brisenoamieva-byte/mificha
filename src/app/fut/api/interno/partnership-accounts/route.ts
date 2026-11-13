import { NextResponse } from "next/server";
import { loadPartnershipAccounts } from "@/lib/partnership-accounts";
import { canAccessPartnershipHub } from "@/lib/partnership-access";
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

  if (!canAccessPartnershipHub({ id: user.id, email: user.email })) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const snapshot = await loadPartnershipAccounts(admin);
    return NextResponse.json(snapshot);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron cargar las cuentas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
