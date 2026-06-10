import { supabase } from "@/lib/supabase";
import type { Season } from "@/types/database";

export async function loadActiveAcademySeason(
  academyId: string,
): Promise<Season | null> {
  const { data: existing } = await supabase
    .from("seasons")
    .select("*")
    .eq("academy_id", academyId)
    .eq("is_active", true)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const response = await fetch("/api/academy/ensure-season", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ academy_id: academyId }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { season?: Season };
  return payload.season ?? null;
}
