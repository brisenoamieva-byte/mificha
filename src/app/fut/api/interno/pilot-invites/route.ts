import { NextResponse } from "next/server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import {
  createPilotInvite,
  deletePilotInvite,
  listPilotInvites,
  summarizePilotInvites,
  updatePilotInvite,
  type PilotInviteInput,
  type PilotInviteStatus,
} from "@/lib/pilot-invite-crm";
import type { GphInviteSegment } from "@/lib/gph-invite-wave";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function requireInterno(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Inicia sesión." }, { status: 401 }) };
  if (!canAccessPitchDeck(user.id, user.email)) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }
  return { user };
}

function parseInput(body: Record<string, unknown>): PilotInviteInput {
  const segment = body.segment;
  const status = body.status;
  const channel = body.channel;
  return {
    tutor_name: body.tutor_name == null ? undefined : String(body.tutor_name),
    player_name:
      body.player_name === undefined
        ? undefined
        : body.player_name == null
          ? null
          : String(body.player_name),
    phone:
      body.phone === undefined
        ? undefined
        : body.phone == null
          ? null
          : String(body.phone),
    email:
      body.email === undefined
        ? undefined
        : body.email == null
          ? null
          : String(body.email),
    segment:
      segment === "caliente" || segment === "tibio" || segment === "frio"
        ? (segment as GphInviteSegment)
        : undefined,
    status: status == null ? undefined : (String(status) as PilotInviteStatus),
    channel:
      channel === "whatsapp" || channel === "email" || channel === "ambos" || channel === null
        ? (channel as PilotInviteInput["channel"])
        : undefined,
    notes:
      body.notes === undefined
        ? undefined
        : body.notes == null
          ? null
          : String(body.notes),
    wave: body.wave == null ? undefined : Number(body.wave),
    mark_invited: Boolean(body.mark_invited),
    mark_reminded: Boolean(body.mark_reminded),
  };
}

export async function GET(request: Request) {
  const gate = await requireInterno(request);
  if ("error" in gate && gate.error) return gate.error;

  try {
    const admin = createSupabaseAdminClient();
    const leads = await listPilotInvites(admin);
    return NextResponse.json({
      leads,
      summary: summarizePilotInvites(leads),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar la ola.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireInterno(request);
  if ("error" in gate && gate.error) return gate.error;
  const user = gate.user!;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "create");

  try {
    const admin = createSupabaseAdminClient();

    if (action === "create") {
      const lead = await createPilotInvite(admin, parseInput(body), user.id);
      const leads = await listPilotInvites(admin);
      return NextResponse.json({
        ok: true,
        lead,
        leads,
        summary: summarizePilotInvites(leads),
      });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "Falta el id." }, { status: 400 });
      }
      const lead = await updatePilotInvite(admin, id, parseInput(body));
      const leads = await listPilotInvites(admin);
      return NextResponse.json({
        ok: true,
        lead,
        leads,
        summary: summarizePilotInvites(leads),
      });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "Falta el id." }, { status: 400 });
      }
      await deletePilotInvite(admin, id);
      const leads = await listPilotInvites(admin);
      return NextResponse.json({
        ok: true,
        leads,
        summary: summarizePilotInvites(leads),
      });
    }

    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
