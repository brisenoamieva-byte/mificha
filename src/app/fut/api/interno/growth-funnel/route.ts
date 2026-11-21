import { NextResponse } from "next/server";
import { canAccessPartnershipHub } from "@/lib/partnership-access";
import { loadGrowthFunnel } from "@/lib/growth-funnel";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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
    const snapshot = await loadGrowthFunnel(admin);
    return NextResponse.json(snapshot);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "funnel_failed" },
      { status: 500 },
    );
  }
}
