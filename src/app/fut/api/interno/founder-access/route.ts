import { NextResponse } from "next/server";
import { canAccessFounderPlaybook } from "@/lib/pitch-access";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    allowed: canAccessFounderPlaybook(user?.id, user?.email),
  });
}
