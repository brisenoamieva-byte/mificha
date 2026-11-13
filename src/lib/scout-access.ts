import { canAccessPartnershipHub } from "@/lib/partnership-access";
import {
  findActivePersonaSub,
  readPersonaSubs,
} from "@/lib/persona-membership";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ExploreAccess } from "@/lib/scout-product";

export {
  SCOUT_PRODUCT,
  scoutWhatsAppCheckoutHref,
  type ExploreAccess,
  type ExploreUnlockReason,
} from "@/lib/scout-product";

function unlockedEmailsFromEnv() {
  return (process.env.SCOUT_UNLOCKED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Buscador: público con datos básicos.
 * Ficha completa: socios MiFicha/GPH (superadmin), role admin/scout, membresía persona,
 * o dueño de esa ficha.
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

  // Ricardo + Gustavo: acceso total a fichas sin membresía.
  if (canAccessPartnershipHub({ id: user.id, email })) {
    return { unlocked: true, reason: "admin", userId: user.id, email };
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

    const active = await findActivePersonaSub(admin, user.id);
    if (active) {
      return { unlocked: true, reason: "scout_sub", userId: user.id, email };
    }

    // Compat: emails listados en el store aunque el user_id haya cambiado.
    const subs = await readPersonaSubs(admin);
    const byEmail = email
      ? subs.find((row) => row.email === email && Date.parse(row.until) > Date.now())
      : null;
    if (byEmail) {
      return { unlocked: true, reason: "scout_sub", userId: user.id, email };
    }
  } catch {
    /* storage/admin unavailable */
  }

  // Sesión válida pero sin membresía / rol / ownership de esta ficha.
  return { unlocked: false, reason: "anonymous", userId: user.id, email };
}
