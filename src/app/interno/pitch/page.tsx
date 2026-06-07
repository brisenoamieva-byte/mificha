import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PitchDeckView } from "@/components/interno/pitch-deck-view";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Pitch deck | MiFicha",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PitchDeckPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/interno/pitch");
  }

  if (!canAccessPitchDeck(user.id)) {
    redirect("/dashboard");
  }

  return <PitchDeckView />;
}
