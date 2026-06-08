import { NextResponse } from "next/server";
import { isResendProductionReady, RESEND_NOT_READY_HINT } from "@/lib/email/resend-config";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const ready = isResendProductionReady();

  return NextResponse.json({
    ready,
    hint: ready ? null : RESEND_NOT_READY_HINT,
  });
}
