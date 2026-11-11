import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/database";

function appOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://mificha.mx";
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  opts?: { emailRedirectTo?: string },
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: opts?.emailRedirectTo ?? `${appOrigin()}/fut/login`,
      data: {
        role,
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // El perfil lo crea el trigger handle_new_user en Supabase.
  // Si ya hay sesión y el trigger falló, intentamos insertar como respaldo.
  if (data.user && data.session) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      role,
      full_name: fullName,
    });

    if (profileError && profileError.code !== "23505") {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function requestPasswordReset(
  email: string,
  opts?: { nextPath?: string },
) {
  const origin = appOrigin();
  const next =
    opts?.nextPath && opts.nextPath.startsWith("/")
      ? opts.nextPath
      : "/fut/login";
  const redirectTo = `${origin}/fut/recuperar/nueva?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });

  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data.role;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const role = await getUserRole();

  if (!role || !allowedRoles.includes(role)) {
    throw new Error("Unauthorized: insufficient permissions");
  }

  return role;
}
