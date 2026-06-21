import {
  computeAcademyCertified,
  computeCertificationMetrics,
} from "@/lib/academy-certification";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Academy } from "@/types/database";

export interface SyncCertificationResult {
  academyId: string;
  certified: boolean;
  changed: boolean;
}

export async function syncAcademyCertificationForClient(
  admin: SupabaseClient,
  academyId: string,
): Promise<SyncCertificationResult> {
  const { data: academy, error: academyError } = await admin
    .from("academies")
    .select("id, city, state, description, is_public, logo_url, is_certified")
    .eq("id", academyId)
    .maybeSingle();

  if (academyError || !academy) {
    throw new Error(academyError?.message ?? "Academia no encontrada.");
  }

  const [playersResult, completedMatchesResult] = await Promise.all([
    admin
      .from("players")
      .select("is_public, public_consent_at, guardian_email, guardian_phone, photo_url")
      .eq("academy_id", academyId),
    admin
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("academy_id", academyId)
      .eq("status", "completed"),
  ]);

  const metrics = computeCertificationMetrics(
    playersResult.data ?? [],
    completedMatchesResult.count ?? 0,
  );

  const certified = computeAcademyCertified(academy as Academy, metrics);
  const changed = academy.is_certified !== certified;

  if (changed) {
    const { error: updateError } = await admin
      .from("academies")
      .update({ is_certified: certified })
      .eq("id", academyId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return { academyId, certified, changed };
}
