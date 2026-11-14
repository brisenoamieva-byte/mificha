import type { Metadata } from "next";
import { ContentHubPage } from "@/components/marketing/content-hub-page";
import { resolveAccountHome, type AccountHome } from "@/lib/account-home";
import { PLANES_HUB, planesHubItemsForAccount } from "@/lib/content-hubs";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Planes | MiFicha",
  description: PLANES_HUB.summary,
};

async function resolvePlanesHome(): Promise<AccountHome | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const admin = createSupabaseAdminClient();
    return await resolveAccountHome(admin, user.id);
  } catch {
    return null;
  }
}

export default async function PlanesPage() {
  const home = await resolvePlanesHome();
  return (
    <ContentHubPage
      title={PLANES_HUB.title}
      summary={PLANES_HUB.summary}
      items={planesHubItemsForAccount(home)}
    />
  );
}
