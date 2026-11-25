import { NextResponse } from "next/server";
import { enrollGphStudent } from "@/lib/gph-enrollment";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

function clientMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent");
  return { ip, userAgent };
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión para inscribirte." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (String(body.honeypot ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const admin = createSupabaseAdminClient();
    const meta = clientMeta(request);
    const result = await enrollGphStudent(admin, user, {
      guardianName: String(body.guardian_name ?? ""),
      guardianPhone: String(body.guardian_phone ?? ""),
      playerName: String(body.player_name ?? ""),
      birthDate: String(body.birth_date ?? ""),
      sede: body.sede as "casa_juventud" | "san_javier",
      schedule: body.schedule as "lun_mie" | "mar_jue",
      position: body.position as "campo" | "portero",
      dominantFoot: body.dominant_foot as "left" | "right" | "both" | undefined,
      acceptorName: String(body.acceptor_name ?? ""),
      privacyAccepted: body.privacy_accepted === true,
      reglamentoAccepted: body.reglamento_accepted === true,
      publicCode: body.public_code ? String(body.public_code) : null,
      selectedChildId: body.selected_child_id
        ? String(body.selected_child_id)
        : null,
      forceNew: body.force_new === true,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (result.status === "needs_choice") {
      return NextResponse.json(
        {
          ok: false,
          needs_choice: true,
          candidates: result.candidates,
          message:
            "Encontramos fichas parecidas. Elige una o crea una nueva para no duplicar.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      reused: result.reused,
      agreement_id: result.agreement.id,
      status: result.agreement.status,
      public_code: result.publicCode,
      amount_mxn: result.agreement.fields.amount_agreed_mxn,
      player_name: result.agreement.fields.player_name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo completar la inscripción.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
