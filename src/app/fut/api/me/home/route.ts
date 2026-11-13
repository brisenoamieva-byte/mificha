import { NextResponse } from "next/server";
import { resolveAccountHome } from "@/lib/account-home";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const home = await resolveAccountHome(admin, user.id);
    return NextResponse.json(home);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo resolver tu acceso.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
