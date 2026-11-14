import { NextResponse } from "next/server";
import { requireAcademyAccess } from "@/lib/academy-members-server";
import { isGphEvaluatorUser } from "@/lib/gph-partner-server";
import {
  listSeasonClaimsForAcademy,
  resolveSeasonClaim,
} from "@/lib/tutor-season-claims";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "Falta academy_id." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);
    const claims = await listSeasonClaimsForAcademy(admin, academyId, {
      status: "open",
    });
    return NextResponse.json({ claims });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    academy_id?: string;
    claim_id?: string;
    decision?: "accepted" | "rejected";
    note?: string;
  };

  const academyId = String(body.academy_id ?? "").trim();
  const claimId = String(body.claim_id ?? "").trim();
  if (!academyId || !claimId) {
    return NextResponse.json(
      { error: "academy_id y claim_id son obligatorios." },
      { status: 400 },
    );
  }
  if (body.decision !== "accepted" && body.decision !== "rejected") {
    return NextResponse.json({ error: "decision inválida." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const isGph = await isGphEvaluatorUser(admin, user.id, user.email);
    if (!isGph) await requireAcademyAccess(supabase, user.id, academyId);

    const claim = await resolveSeasonClaim(admin, {
      claimId,
      academyId,
      decision: body.decision,
      note: body.note,
    });
    return NextResponse.json({ ok: true, claim });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo resolver.";
    const status = message === "No autorizado." ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
