import { NextResponse } from "next/server";
import { findInviteByToken } from "@/lib/academy-members-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  try {
    const admin = createSupabaseAdminClient();
    const invite = await findInviteByToken(admin, token);
    if (!invite || invite.status === "revoked") {
      return NextResponse.json({ error: "Invitación no válida." }, { status: 404 });
    }
    if (
      invite.invite_expires_at &&
      new Date(invite.invite_expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json({ error: "La invitación expiró." }, { status: 410 });
    }
    return NextResponse.json({
      academy_name: invite.academy_name,
      invited_name: invite.invited_name,
      invited_email: invite.invited_email,
      status: invite.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de servidor.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
