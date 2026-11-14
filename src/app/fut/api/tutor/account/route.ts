import { NextResponse } from "next/server";
import { deletePersonaAccount } from "@/lib/tutor-family";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

const CONFIRM_WORD = "ELIMINAR";

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.action !== "delete") {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const confirm = String(body.confirm ?? "")
    .trim()
    .toUpperCase();
  if (confirm !== CONFIRM_WORD) {
    return NextResponse.json(
      { error: `Para confirmar, escribe ${CONFIRM_WORD}.` },
      { status: 400 },
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const result = await deletePersonaAccount(admin, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar la cuenta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
