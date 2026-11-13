import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ExploreAccess } from "@/lib/scout-product";

export {
  SCOUT_PRODUCT,
  scoutWhatsAppCheckoutHref,
  type ExploreAccess,
  type ExploreUnlockReason,
} from "@/lib/scout-product";

type ScoutSubRow = {
  user_id: string;
  email: string | null;
  until: string;
  created_at: string;
};

const SCOUT_STORE = "payments/scout-subscriptions.json";

function unlockedEmailsFromEnv() {
  return (process.env.SCOUT_UNLOCKED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isFutureIso(iso: string) {
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > Date.now();
}

async function readScoutSubs(admin: SupabaseClient): Promise<ScoutSubRow[]> {
  const { data, error } = await admin.storage.from("mificha-ops").download(SCOUT_STORE);
  if (error || !data) return [];
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as ScoutSubRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Buscador: público con datos básicos.
 * Ficha completa: membresía persona (Explorar Pro), staff, o dueño de esa ficha.
 * Sin membresía, familia/representante solo publican con opt-in; no desbloquean el detalle de terceros.
 */
export async function resolveExploreAccess(options?: {
  ownerUserId?: string | null;
}): Promise<ExploreAccess> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { unlocked: false, reason: "anonymous", userId: null, email: null };
  }

  const email = (user.email ?? "").trim().toLowerCase();
  if (options?.ownerUserId && options.ownerUserId === user.id) {
    return { unlocked: true, reason: "owner", userId: user.id, email };
  }

  if (email && unlockedEmailsFromEnv().includes(email)) {
    return { unlocked: true, reason: "scout_sub", userId: user.id, email };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = (profile as { role?: string } | null)?.role;
    if (role === "admin" || role === "scout") {
      return { unlocked: true, reason: "admin", userId: user.id, email };
    }

    const subs = await readScoutSubs(admin);
    const active = subs.find(
      (row) => row.user_id === user.id && isFutureIso(row.until),
    );
    if (active) {
      return { unlocked: true, reason: "scout_sub", userId: user.id, email };
    }
  } catch {
    /* storage/admin unavailable */
  }

  return { unlocked: false, reason: "anonymous", userId: user.id, email };
}
