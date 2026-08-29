import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { provisionGphPartner } from "@/lib/gph-partner-server";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email) || !user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    full_name?: string;
    academy_name?: string;
    city?: string;
  };

  try {
    const result = await provisionGphPartner({
      email: body.email ?? "",
      fullName: body.full_name,
      academyName: body.academy_name,
      city: body.city,
      grantedBy: user.id,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el acceso.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
