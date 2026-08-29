import { NextResponse } from "next/server";
import { acceptInviteForUser } from "@/lib/academy-members-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { token } = await context.params;

  try {
    const admin = createSupabaseAdminClient();
    const accepted = await acceptInviteForUser(admin, user.id, user.email, token);
    return NextResponse.json({ ok: true, academy_id: accepted?.academy_id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo unir.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
