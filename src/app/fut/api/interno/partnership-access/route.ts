import { NextResponse } from "next/server";
import { canAccessPartnershipHub } from "@/lib/partnership-access";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    allowed: canAccessPartnershipHub({
      id: user?.id,
      email: user?.email,
    }),
  });
}
