import type { SupabaseClient } from "@supabase/supabase-js";
import { listGuardianKindsForUser, type GuardianKind } from "@/lib/tutor-family";

export type AccountHomeKind =
  | "tutor"
  | "agente"
  | "academia"
  | "admin"
  | "scout"
  | "elige";

export type AccountHome = {
  path: string;
  kind: AccountHomeKind;
  label: string;
  kinds: GuardianKind[];
};

/**
 * Tras login: un solo destino según lo que ya tiene la cuenta.
 * Prioridad: fichas tutor/agente → staff real → elegir.
 * (Muchos tutores se registraron con role academy_admin por el flujo legacy.)
 */
export async function resolveAccountHome(
  admin: SupabaseClient,
  userId: string,
): Promise<AccountHome> {
  const kinds = await listGuardianKindsForUser(admin, userId);
  if (kinds.length > 0) {
    return { path: "/fut/tutor", kind: "tutor", label: "Tus fichas", kinds };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const role = (profile as { role?: string } | null)?.role ?? null;

  if (role === "admin") {
    return { path: "/fut/dashboard", kind: "admin", label: "Panel", kinds: [] };
  }
  if (role === "scout") {
    return { path: "/fut/explorar", kind: "scout", label: "Explorar", kinds: [] };
  }

  const { data: owned } = await admin
    .from("academies")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (owned) {
    return {
      path: "/fut/dashboard",
      kind: "academia",
      label: "Panel academia",
      kinds: [],
    };
  }

  const { data: membership } = await admin
    .from("academy_members")
    .select("academy_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (membership) {
    return {
      path: "/fut/dashboard",
      kind: "academia",
      label: "Panel academia",
      kinds: [],
    };
  }

  return {
    path: "/fut/entrar?elige=1",
    kind: "elige",
    label: "Elegir tipo de cuenta",
    kinds: [],
  };
}
