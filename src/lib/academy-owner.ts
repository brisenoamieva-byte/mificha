import { supabase } from "@/lib/supabase";
import type { Academy } from "@/types/database";

/** One owner may have multiple rows; PostgREST `.maybeSingle()` fails in that case. */
export async function fetchAcademyForOwner(ownerId: string): Promise<Academy | null> {
  const { data, error } = await supabase
    .from("academies")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function countAcademiesForOwner(ownerId: string): Promise<number> {
  const { count, error } = await supabase
    .from("academies")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if (error) throw error;
  return count ?? 0;
}
