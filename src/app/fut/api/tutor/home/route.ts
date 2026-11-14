import { NextResponse } from "next/server";
import {
  listGuardianChildren,
  listTutorMaterials,
  listTutorSeasons,
  membershipIsActive,
  normalizeGuardianKind,
} from "@/lib/tutor-family";
import { getTutorFichaViewStats } from "@/lib/tutor-ficha-views";
import {
  fetchTutorLinkedPerformance,
  fetchTutorLinkedPerformances,
} from "@/lib/tutor-linked-performance";
import { getSeasonClaimMapForChild } from "@/lib/tutor-season-claims";
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

  const url = new URL(request.url);
  const phone = url.searchParams.get("phone");
  const kindParam = url.searchParams.get("kind");
  const kind =
    !kindParam || kindParam === "all" ? ("all" as const) : normalizeGuardianKind(kindParam);
  try {
    const admin = createSupabaseAdminClient();
    const children = await listGuardianChildren(admin, user, phone, kind);
    const detailed = await Promise.all(
      children.map(async (child) => ({
        ...child,
        active: membershipIsActive(child.membership_until),
        materials: await listTutorMaterials(admin, child),
        seasons: await listTutorSeasons(admin, child),
        season_claims: await getSeasonClaimMapForChild(admin, child.id),
        linked_performance: await fetchTutorLinkedPerformance(admin, child),
        linked_performances: await fetchTutorLinkedPerformances(admin, child),
        memberships: child.memberships ?? [],
        view_stats: await getTutorFichaViewStats(admin, child.id),
      })),
    );
    return NextResponse.json({ children: detailed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar tu ficha.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
