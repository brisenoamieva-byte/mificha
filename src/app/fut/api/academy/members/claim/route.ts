import { NextResponse } from "next/server";
import { acceptInviteForUser } from "@/lib/academy-members-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

/** Activa invitaciones pendientes que coincidan con el correo del usuario. */
export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const email = user.email?.trim();
  if (!email) return NextResponse.json({ claimed: false });

  try {
    const admin = createSupabaseAdminClient();
    const claimed = await acceptInviteForUser(admin, user.id, email);
    return NextResponse.json({ claimed: Boolean(claimed) });
  } catch {
    return NextResponse.json({ claimed: false });
  }
}
