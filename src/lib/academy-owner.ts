import { supabase } from "@/lib/supabase";
import type { Academy } from "@/types/database";

export type AcademyAccessRole = "owner" | "staff";

export interface AcademySession {
  academy: Academy;
  role: AcademyAccessRole;
}

/** One owner may have multiple rows; PostgREST `.maybeSingle()` fails in that case. */
export async function fetchAcademyForOwner(ownerId: string): Promise<Academy | null> {
  const { data, error } = await supabase
    .from("academies")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("fetchAcademyForOwner", error.message);
    return null;
  }
  return data?.[0] ?? null;
}

export async function fetchAcademySessionForUser(
  userId: string,
): Promise<AcademySession | null> {
  const owned = await fetchAcademyForOwner(userId);
  if (owned) return { academy: owned, role: "owner" };

  const { data: membership, error } = await supabase
    .from("academy_members")
    .select("academy_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    if (
      error.message.includes("academy_members") ||
      error.code === "PGRST205" ||
      error.code === "42P17"
    ) {
      return null;
    }
    throw error;
  }
  if (!membership) return null;

  const { data: academy, error: academyError } = await supabase
    .from("academies")
    .select("*")
    .eq("id", membership.academy_id as string)
    .maybeSingle();

  if (academyError) {
    console.error("fetchAcademySessionForUser", academyError.message);
    return null;
  }
  if (!academy) return null;
  return { academy, role: "staff" };
}

export async function countAcademiesForOwner(ownerId: string): Promise<number> {
  const { count, error } = await supabase
    .from("academies")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if (error) throw error;
  return count ?? 0;
}
