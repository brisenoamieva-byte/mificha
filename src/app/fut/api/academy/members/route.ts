import { NextResponse } from "next/server";
import {
  inviteAcademyMember,
  listAcademyMembers,
  revokeAcademyMember,
} from "@/lib/academy-members-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function requireOwner(request: Request, academyId: string) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };

  const admin = createSupabaseAdminClient();
  const { data: academy } = await admin
    .from("academies")
    .select("id, owner_id, name")
    .eq("id", academyId)
    .maybeSingle();

  if (!academy || academy.owner_id !== user.id) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }

  return { user, admin, academy };
}

export async function GET(request: Request) {
  const academyId = new URL(request.url).searchParams.get("academy_id")?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  const gate = await requireOwner(request, academyId);
  if ("error" in gate && gate.error) return gate.error;

  try {
    const members = await listAcademyMembers(gate.admin!, academyId);
    return NextResponse.json({ members });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar el equipo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    academy_id?: string;
    email?: string;
    name?: string;
  };
  const academyId = body.academy_id?.trim();
  if (!academyId) {
    return NextResponse.json({ error: "academy_id es obligatorio." }, { status: 400 });
  }

  const gate = await requireOwner(request, academyId);
  if ("error" in gate && gate.error) return gate.error;

  try {
    const invited = await inviteAcademyMember(gate.admin!, {
      academyId,
      invitedBy: gate.user!.id,
      email: body.email ?? "",
      name: body.name ?? "",
    });
    return NextResponse.json({
      member: invited.member,
      invite_url: invited.inviteUrl,
      academy_name: invited.academyName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo invitar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const academyId = url.searchParams.get("academy_id")?.trim();
  const memberId = url.searchParams.get("member_id")?.trim();
  if (!academyId || !memberId) {
    return NextResponse.json(
      { error: "academy_id y member_id son obligatorios." },
      { status: 400 },
    );
  }

  const gate = await requireOwner(request, academyId);
  if ("error" in gate && gate.error) return gate.error;

  try {
    await revokeAcademyMember(gate.admin!, academyId, memberId, gate.user!.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo quitar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
