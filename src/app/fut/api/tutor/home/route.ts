import { NextResponse } from "next/server";
import {
  listTutorMaterials,
  listTutorSeasons,
  membershipIsActive,
  syncTutorChildren,
} from "@/lib/tutor-family";
import { fetchTutorLinkedPerformance } from "@/lib/tutor-linked-performance";
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

  const phone = new URL(request.url).searchParams.get("phone");
  try {
    const admin = createSupabaseAdminClient();
    const children = await syncTutorChildren(admin, user, phone);
    const detailed = await Promise.all(
      children.map(async (child) => ({
        ...child,
        active: membershipIsActive(child.membership_until),
        materials: await listTutorMaterials(admin, child),
        seasons: await listTutorSeasons(admin, child),
        linked_performance: await fetchTutorLinkedPerformance(admin, child),
      })),
    );
    return NextResponse.json({ children: detailed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar tu ficha.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
