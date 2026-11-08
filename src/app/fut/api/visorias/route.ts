import { NextResponse } from "next/server";
import {
  canManageVisorias,
  insertVisoriaRegistration,
  listVisoriaRegistrations,
  type VisoriaRegistrationInput,
} from "@/lib/visoria-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VisoriaRegistrationInput;

  try {
    const admin = createSupabaseAdminClient();
    const row = await insertVisoriaRegistration(admin, {
      ...body,
      source: body.source ?? "platform",
    });
    return NextResponse.json({
      ok: true,
      folio: row.folio,
      public_code: row.public_code ?? null,
      player_full_name: row.player_full_name,
      attend_thursday: row.attend_thursday,
      attend_friday: row.attend_friday,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar el registro.";
    const status = (error as { status?: number }).status ?? 400;
    return NextResponse.json({ error: message }, { status });
  }
}

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
    if (!(await canManageVisorias(admin, user))) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }
    const registrations = await listVisoriaRegistrations(admin);
    return NextResponse.json({ registrations, count: registrations.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar la lista.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
