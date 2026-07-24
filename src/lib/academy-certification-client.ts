import { supabase } from "@/lib/supabase";

export async function requestAcademyCertificationSync(academyId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  try {
    const response = await fetch("/fut/api/academy/sync-certification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ academy_id: academyId }),
    });

    if (!response.ok) return null;

    return (await response.json()) as {
      certified: boolean;
      changed: boolean;
    };
  } catch {
    return null;
  }
}
