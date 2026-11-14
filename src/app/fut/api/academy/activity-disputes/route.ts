import { NextResponse } from "next/server";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import {
  listAcademyActivityDisputes,
  resolveAcademyActivityDispute,
  type TutorActivityResolveDecision,
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

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "Falta academy_id." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);
    const events = await listAcademyActivityDisputes(admin, academyId);
    return NextResponse.json({ events });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron cargar disputas.";
    const status = message === "No autorizado." ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
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

  const body = (await request.json().catch(() => ({}))) as {
    academy_id?: string;
    event_id?: string;
    decision?: TutorActivityResolveDecision;
    note?: string;
  };

  const academyId = String(body.academy_id ?? "").trim();
  const eventId = String(body.event_id ?? "").trim();
  if (!academyId || !eventId) {
    return NextResponse.json(
      { error: "academy_id y event_id son obligatorios." },
      { status: 400 },
    );
  }
  if (body.decision !== "confirmed" && body.decision !== "corrected") {
    return NextResponse.json({ error: "decision inválida." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);

    const event = await resolveAcademyActivityDispute(admin, {
      eventId,
      academyId,
      decision: body.decision,
      note: body.note,
    });
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo resolver.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
