import { NextResponse } from "next/server";
import {
  acknowledgeTutorActivity,
  disputeTutorActivity,
  listTutorActivityForGuardian,
} from "@/lib/tutor-activity";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const events = await listTutorActivityForGuardian(admin, user.id);
    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la actividad.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "acknowledge" | "dispute";
    event_id?: string;
    note?: string;
  };

  const eventId = body.event_id?.trim();
  if (!eventId) {
    return NextResponse.json({ error: "Falta event_id." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    if (body.action === "acknowledge") {
      const event = await acknowledgeTutorActivity(admin, user.id, eventId);
      return NextResponse.json({ event });
    }
    if (body.action === "dispute") {
      const event = await disputeTutorActivity(admin, user.id, eventId, body.note ?? "");
      return NextResponse.json({ event });
    }
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
