import { NextResponse } from "next/server";
import { setAcademyCoverUrl } from "@/lib/academy-cover-store";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

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
    cover_url?: string | null;
  };
  const academyId = String(body.academy_id ?? "").trim();
  if (!academyId) {
    return NextResponse.json({ error: "Falta academy_id." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: academy, error } = await admin
    .from("academies")
    .select("id, owner_id")
    .eq("id", academyId)
    .maybeSingle();
  if (error || !academy) {
    return NextResponse.json({ error: "Academia no encontrada." }, { status: 404 });
  }
  if (academy.owner_id !== user.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const coverUrl = await setAcademyCoverUrl(
      admin,
      academyId,
      body.cover_url === undefined ? null : body.cover_url,
    );
    return NextResponse.json({ ok: true, cover_url: coverUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo guardar la portada.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
