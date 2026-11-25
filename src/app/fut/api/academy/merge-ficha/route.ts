import { NextResponse } from "next/server";
import { assertCanManageGphAgreements, resolveGphAcademy } from "@/lib/gph-agreements";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import { mergeTutorChildrenByPublicCode } from "@/lib/tutor-family";

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    keep_code?: string;
    absorb_code?: string;
  };

  try {
    const admin = createSupabaseAdminClient();
    const academy = await resolveGphAcademy(admin);
    await assertCanManageGphAgreements(admin, user, academy.id);

    const result = await mergeTutorChildrenByPublicCode(admin, {
      keepCode: String(body.keep_code ?? ""),
      absorbCode: String(body.absorb_code ?? ""),
    });

    return NextResponse.json({
      ok: true,
      keep_code: result.keep.public_code,
      keep_child_id: result.keep.id,
      absorbed_code: body.absorb_code,
      alias_codes: result.alias_codes,
      agreements_moved: result.agreements_moved,
      player_name: result.keep.player_name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo fusionar.";
    const status =
      message.includes("autorizado") || message.includes("solo aplica") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
